package com.mahasetu.interop.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
public class DepartmentClientRegistry {

    private final Map<String, DepartmentClient> clientMap = new HashMap<>();

    public DepartmentClientRegistry(List<DepartmentClient> clients) {
        for (DepartmentClient client : clients) {
            clientMap.put(client.getDepartmentCode().toUpperCase(), client);
            clientMap.put(client.getShortCode().toUpperCase(), client);
        }
        log.info("Initialized DepartmentClientRegistry with [{}] department clients: {}", clients.size(), clientMap.keySet());
    }

    public Optional<DepartmentClient> getClient(String departmentCode) {
        if (departmentCode == null) return Optional.empty();
        return Optional.ofNullable(clientMap.get(departmentCode.trim().toUpperCase()));
    }

    public boolean supports(String departmentCode) {
        if (departmentCode == null) return false;
        return clientMap.containsKey(departmentCode.trim().toUpperCase());
    }
}
