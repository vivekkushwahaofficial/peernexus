package com.peernexus.peernexus.doubt.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.peernexus.peernexus.doubt.dto.DoubtCreateRequest;
import com.peernexus.peernexus.doubt.dto.DoubtImageUploadRequest;
import com.peernexus.peernexus.doubt.dto.DoubtResponse;
import com.peernexus.peernexus.doubt.dto.DoubtUpdateRequest;

public interface DoubtService {

    DoubtResponse create(DoubtCreateRequest request);

    DoubtResponse update(Long id, DoubtUpdateRequest request);

    void delete(Long id);

    DoubtResponse getById(Long id);

    Page<DoubtResponse> getAll(Pageable pageable);

    Page<DoubtResponse> search(String query, Pageable pageable);

    Page<DoubtResponse> getByCategory(Long categoryId, Pageable pageable);

    DoubtResponse addImages(Long id, DoubtImageUploadRequest request);
}
