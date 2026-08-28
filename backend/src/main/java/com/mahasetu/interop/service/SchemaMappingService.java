package com.mahasetu.interop.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahasetu.interop.dto.canonical.*;
import com.mahasetu.interop.entity.Department;
import com.mahasetu.interop.entity.SchemaMapping;
import com.mahasetu.interop.exception.ResourceNotFoundException;
import com.mahasetu.interop.repository.DepartmentRepository;
import com.mahasetu.interop.repository.SchemaMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchemaMappingService {

    private final SchemaMappingRepository schemaMappingRepository;
    private final DepartmentRepository departmentRepository;
    private final ObjectMapper objectMapper;

    /**
     * Transforms raw department data payload into structured canonical fields.
     *
     * @param departmentCode Source department code (e.g. REV, AGR, WEL)
     * @param rawData        Raw response object or Map
     * @return Map of nested canonical paths and converted values
     */
    @Transactional(readOnly = true)
    public Map<String, Object> transformRawData(String departmentCode, Object rawData) {
        if (rawData == null || departmentCode == null) {
            return Collections.emptyMap();
        }

        Map<String, Object> sourceMap = convertToMap(rawData);
        if (sourceMap.isEmpty()) {
            return Collections.emptyMap();
        }

        // Normalize department code
        String normDeptCode = normalizeDepartmentCode(departmentCode);

        // Fetch active mappings for this department
        List<SchemaMapping> mappings = schemaMappingRepository.findBySourceDepartment_DepartmentCodeAndIsActiveTrue(normDeptCode);
        if (mappings.isEmpty()) {
            log.warn("No active schema mappings found in PostgreSQL for department: {}", normDeptCode);
            return Collections.emptyMap();
        }

        Map<String, Object> canonicalTree = new LinkedHashMap<>();

        for (SchemaMapping mapping : mappings) {
            try {
                String sourceField = mapping.getSourceField();
                String targetPath = mapping.getTargetField();
                String dataType = mapping.getDataType() != null ? mapping.getDataType().toUpperCase() : "STRING";

                Object rawValue = extractSourceValue(sourceMap, sourceField);
                if (rawValue != null) {
                    Object coercedValue = coerceDataType(rawValue, dataType, mapping.getTransformationRule());
                    if (coercedValue != null) {
                        setNestedProperty(canonicalTree, targetPath, coercedValue);
                    }
                }
            } catch (Exception ex) {
                log.error("Schema transformation error for rule [{}] -> [{}]: {}", 
                        mapping.getSourceField(), mapping.getTargetField(), ex.getMessage());
            }
        }

        return canonicalTree;
    }

    /**
     * Converts raw object or map to standard Map<String, Object>.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> convertToMap(Object obj) {
        if (obj == null) return Collections.emptyMap();
        if (obj instanceof Map) {
            return (Map<String, Object>) obj;
        }
        try {
            return objectMapper.convertValue(obj, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to convert raw object to map: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    /**
     * Extracts value from map using direct key or nested dot notation.
     */
    private Object extractSourceValue(Map<String, Object> sourceMap, String sourceField) {
        if (sourceMap.containsKey(sourceField)) {
            return sourceMap.get(sourceField);
        }
        // Check without table/prefix if formatted like "revenue_land_records.survey_no"
        if (sourceField.contains(".")) {
            String[] parts = sourceField.split("\\.");
            String simpleKey = parts[parts.length - 1];
            if (sourceMap.containsKey(simpleKey)) {
                return sourceMap.get(simpleKey);
            }
            // Navigate nested map if present
            Object current = sourceMap;
            for (String part : parts) {
                if (current instanceof Map) {
                    current = ((Map<?, ?>) current).get(part);
                } else {
                    current = null;
                    break;
                }
            }
            if (current != null) return current;
        }
        return null;
    }

    /**
     * Coerces raw value into specified data type.
     */
    public Object coerceDataType(Object value, String dataType, String transformationRule) {
        if (value == null) return null;

        try {
            switch (dataType) {
                case "DOUBLE":
                case "NUMBER":
                    if (value instanceof Number) {
                        return ((Number) value).doubleValue();
                    }
                    String strVal = value.toString().replaceAll("[^0-9.-]", "").trim();
                    return strVal.isEmpty() ? null : Double.parseDouble(strVal);

                case "INTEGER":
                case "INT":
                    if (value instanceof Number) {
                        return ((Number) value).intValue();
                    }
                    String intStr = value.toString().replaceAll("[^0-9-]", "").trim();
                    return intStr.isEmpty() ? null : Integer.parseInt(intStr);

                case "BOOLEAN":
                case "BOOL":
                    if (value instanceof Boolean) {
                        return value;
                    }
                    String bStr = value.toString().trim().toLowerCase();
                    return "true".equals(bStr) || "yes".equals(bStr) || "1".equals(bStr) || "approved".equals(bStr) || "active".equals(bStr);

                case "STRING":
                default:
                    return value.toString().trim();
            }
        } catch (Exception e) {
            log.warn("Type coercion failure for value [{}] to type [{}]: {}", value, dataType, e.getMessage());
            return value.toString();
        }
    }

    /**
     * Sets value into a nested map structure using dot notation (e.g. "location.district").
     */
    @SuppressWarnings("unchecked")
    public void setNestedProperty(Map<String, Object> map, String path, Object value) {
        if (path == null || path.isEmpty()) return;

        String[] parts = path.split("\\.");
        Map<String, Object> current = map;

        for (int i = 0; i < parts.length - 1; i++) {
            String part = parts[i];
            Object existing = current.get(part);
            if (!(existing instanceof Map)) {
                Map<String, Object> newChild = new LinkedHashMap<>();
                current.put(part, newChild);
                current = newChild;
            } else {
                current = (Map<String, Object>) existing;
            }
        }

        current.put(parts[parts.length - 1], value);
    }

    /**
     * Normalizes department code (e.g. REVENUE -> REV).
     */
    public String normalizeDepartmentCode(String code) {
        if (code == null) return "";
        String upper = code.trim().toUpperCase();
        if ("REVENUE".equals(upper) || "REV".equals(upper)) return "REV";
        if ("AGRICULTURE".equals(upper) || "AGR".equals(upper)) return "AGR";
        if ("WELFARE".equals(upper) || "WEL".equals(upper)) return "WEL";
        return upper;
    }

    // =========================================================================
    // Schema Mapping Administrative CRUD Operations
    // =========================================================================

    @Transactional(readOnly = true)
    public List<SchemaMappingDto> getAllMappings(String departmentCode) {
        List<SchemaMapping> list;
        if (departmentCode != null && !departmentCode.trim().isEmpty()) {
            String norm = normalizeDepartmentCode(departmentCode);
            list = schemaMappingRepository.findBySourceDepartment_DepartmentCode(norm);
        } else {
            list = schemaMappingRepository.findAll();
        }
        return list.stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public SchemaMappingDto getMappingById(Long id) {
        SchemaMapping mapping = schemaMappingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schema mapping not found with ID: " + id));
        return mapToDto(mapping);
    }

    @Transactional
    public SchemaMappingDto createMapping(SchemaMappingDto dto) {
        String normDept = normalizeDepartmentCode(dto.getDepartmentCode());
        Department sourceDept = departmentRepository.findByDepartmentCode(normDept)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with code: " + dto.getDepartmentCode()));

        SchemaMapping mapping = SchemaMapping.builder()
                .sourceDepartment(sourceDept)
                .targetDepartment(null)
                .entityType(dto.getEntityType() != null ? dto.getEntityType() : "CANONICAL_MAPPING")
                .sourceField(dto.getSourceField().trim())
                .targetField(dto.getCanonicalField().trim())
                .dataType(dto.getDataType() != null ? dto.getDataType().toUpperCase() : "STRING")
                .transformationRule(dto.getTransformationRule() != null ? dto.getTransformationRule().toUpperCase() : "DIRECT_MAP")
                .version(dto.getVersion() != null ? dto.getVersion() : "1.0")
                .description(dto.getDescription())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        SchemaMapping saved = schemaMappingRepository.save(mapping);
        log.info("Admin created new schema mapping ID [{}]: {} -> {}", saved.getId(), saved.getSourceField(), saved.getTargetField());
        return mapToDto(saved);
    }

    @Transactional
    public SchemaMappingDto updateMapping(Long id, SchemaMappingDto dto) {
        SchemaMapping mapping = schemaMappingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schema mapping not found with ID: " + id));

        if (dto.getDepartmentCode() != null) {
            String normDept = normalizeDepartmentCode(dto.getDepartmentCode());
            Department sourceDept = departmentRepository.findByDepartmentCode(normDept)
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with code: " + dto.getDepartmentCode()));
            mapping.setSourceDepartment(sourceDept);
        }

        if (dto.getSourceField() != null) mapping.setSourceField(dto.getSourceField().trim());
        if (dto.getCanonicalField() != null) mapping.setTargetField(dto.getCanonicalField().trim());
        if (dto.getDataType() != null) mapping.setDataType(dto.getDataType().toUpperCase());
        if (dto.getTransformationRule() != null) mapping.setTransformationRule(dto.getTransformationRule().toUpperCase());
        if (dto.getVersion() != null) mapping.setVersion(dto.getVersion());
        if (dto.getDescription() != null) mapping.setDescription(dto.getDescription());
        if (dto.getIsActive() != null) mapping.setIsActive(dto.getIsActive());

        SchemaMapping updated = schemaMappingRepository.save(mapping);
        log.info("Admin updated schema mapping ID [{}]: {} -> {}", updated.getId(), updated.getSourceField(), updated.getTargetField());
        return mapToDto(updated);
    }

    @Transactional
    public void deleteMapping(Long id) {
        if (!schemaMappingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Schema mapping not found with ID: " + id);
        }
        schemaMappingRepository.deleteById(id);
        log.info("Admin deleted schema mapping ID [{}]", id);
    }

    private SchemaMappingDto mapToDto(SchemaMapping m) {
        return SchemaMappingDto.builder()
                .id(m.getId())
                .departmentCode(m.getSourceDepartment() != null ? m.getSourceDepartment().getDepartmentCode() : "SYS")
                .departmentName(m.getSourceDepartment() != null ? m.getSourceDepartment().getName() : "System Canonical")
                .entityType(m.getEntityType())
                .sourceField(m.getSourceField())
                .canonicalField(m.getTargetField())
                .dataType(m.getDataType())
                .transformationRule(m.getTransformationRule())
                .version(m.getVersion())
                .description(m.getDescription())
                .isActive(m.getIsActive())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
