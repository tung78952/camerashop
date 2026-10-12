// One technical spec row (group, label, value) embedded in a product; it has no identity of its own.

package com.camerashop.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductSpec {

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "label")
    private String label;

    @Column(name = "value")
    private String value;

    public ProductSpec(String groupName, String label, String value) {
        this.groupName = groupName;
        this.label = label;
        this.value = value;
    }
}
