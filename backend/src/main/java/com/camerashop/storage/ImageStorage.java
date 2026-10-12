// Where uploaded images are stored; implementations: local disk (dev) and Cloudinary (production).

package com.camerashop.storage;

public interface ImageStorage {

    String save(String fileName, byte[] content);
}
