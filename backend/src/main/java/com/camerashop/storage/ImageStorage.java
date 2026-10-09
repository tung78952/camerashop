package com.camerashop.storage;

public interface ImageStorage {

    String save(String fileName, byte[] content);
}
