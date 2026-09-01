package com.mahasetu.interop.controller;

import com.mahasetu.interop.dto.*;
import com.mahasetu.interop.entity.Role;
import com.mahasetu.interop.entity.RoleType;
import com.mahasetu.interop.entity.User;
import com.mahasetu.interop.repository.CitizenRepository;
import com.mahasetu.interop.repository.RoleRepository;
import com.mahasetu.interop.repository.UserRepository;
import com.mahasetu.interop.security.JwtTokenProvider;
import com.mahasetu.interop.service.CitizenProvisioningService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CitizenRepository citizenRepository;
    private final CitizenProvisioningService citizenProvisioningService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsernameOrEmail().trim(),
                    loginRequest.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            User user = (User) authentication.getPrincipal();
            String jwt = tokenProvider.generateToken(authentication);

            AuthResponse response = AuthResponse.builder()
                .status("SUCCESS")
                .message("User authenticated successfully")
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresInMs(tokenProvider.getExpirationMs())
                .user(mapToProfileDto(user))
                .timestamp(OffsetDateTime.now())
                .build();

            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            log.warn("Failed authentication attempt for: {}", loginRequest.getUsernameOrEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ErrorResponse.builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .error("Unauthorized")
                    .message("Invalid username/email or password")
                    .timestamp(OffsetDateTime.now())
                    .build()
            );
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        String username = registerRequest.getUsername().trim().toLowerCase();
        String email = registerRequest.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message("Username '" + username + "' is already registered")
                    .timestamp(OffsetDateTime.now())
                    .build()
            );
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Bad Request")
                    .message("Email '" + email + "' is already registered")
                    .timestamp(OffsetDateTime.now())
                    .build()
            );
        }

        // Determine Role
        Role userRole;
        String requestedRole = registerRequest.getRole();
        String deptCode = registerRequest.getDepartmentCode();

        if ("ROLE_ADMIN".equalsIgnoreCase(requestedRole) || "ADMIN".equalsIgnoreCase(requestedRole)) {
            userRole = roleRepository.findByName(RoleType.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_ADMIN).description("Platform Administrator").build()));
            deptCode = null;
        } else if ("ROLE_DEPARTMENT_OFFICER".equalsIgnoreCase(requestedRole) || "OFFICER".equalsIgnoreCase(requestedRole)
                || (deptCode != null && !deptCode.isBlank())) {
            userRole = roleRepository.findByName(RoleType.ROLE_DEPARTMENT_OFFICER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_DEPARTMENT_OFFICER).description("Department Officer").build()));
            if (deptCode == null || deptCode.isBlank()) {
                deptCode = "REV";
            }
        } else {
            userRole = roleRepository.findByName(RoleType.ROLE_CITIZEN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_CITIZEN).description("Citizen").build()));
            deptCode = null;
        }

        String citizenId = registerRequest.getCitizenId();
        if (userRole.getName() == RoleType.ROLE_CITIZEN) {
            if (citizenId == null || citizenId.isBlank()) {
                citizenId = "MH-CIT-10001";
            } else {
                citizenId = citizenId.trim();
            }
            citizenProvisioningService.getOrCreateCitizen(citizenId, registerRequest.getFullName(), email, registerRequest.getPhone());
        } else {
            citizenId = null;
        }

        String maskedPhone = registerRequest.getPhone();
        if (maskedPhone != null && maskedPhone.length() >= 10) {
            maskedPhone = "+91-XXXXX-" + maskedPhone.substring(maskedPhone.length() - 4);
        }

        User newUser = User.builder()
            .username(username)
            .email(email)
            .passwordHash(passwordEncoder.encode(registerRequest.getPassword()))
            .fullName(registerRequest.getFullName().trim())
            .phoneMasked(maskedPhone)
            .departmentCode(deptCode)
            .citizenId(citizenId)
            .isActive(true)
            .roles(new HashSet<>(Collections.singletonList(userRole)))
            .build();

        User savedUser = userRepository.save(newUser);
        String jwt = tokenProvider.generateTokenFromUser(savedUser);

        AuthResponse response = AuthResponse.builder()
            .status("SUCCESS")
            .message("User registered successfully")
            .accessToken(jwt)
            .tokenType("Bearer")
            .expiresInMs(tokenProvider.getExpirationMs())
            .user(mapToProfileDto(savedUser))
            .timestamp(OffsetDateTime.now())
            .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ErrorResponse.builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .error("Unauthorized")
                    .message("No active session found")
                    .timestamp(OffsetDateTime.now())
                    .build()
            );
        }
        return ResponseEntity.ok(mapToProfileDto(user));
    }

    private UserProfileDto mapToProfileDto(User user) {
        List<String> roles = user.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());

        return UserProfileDto.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phoneMasked(user.getPhoneMasked())
            .departmentCode(user.getDepartmentCode())
            .citizenId(user.getCitizenId())
            .roles(roles)
            .active(user.isEnabled())
            .build();
    }
}
