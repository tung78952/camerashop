// Abstraction over the LLM: system prompt + conversation in, answer out (faked in tests).

package com.camerashop.chat;

import java.util.List;

public interface ChatModel {

    String generate(String systemPrompt, List<ChatTurn> turns);

    record ChatTurn(boolean fromUser, String text) {
    }
}
