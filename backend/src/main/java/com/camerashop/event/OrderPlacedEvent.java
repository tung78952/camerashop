// Published after an order is placed; carries only the id so listeners reload it after commit.

package com.camerashop.event;

public record OrderPlacedEvent(Long orderId) {
}
