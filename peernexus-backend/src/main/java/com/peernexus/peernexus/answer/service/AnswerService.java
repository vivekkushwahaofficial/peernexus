package com.peernexus.peernexus.answer.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.peernexus.peernexus.answer.dto.AnswerCreateRequest;
import com.peernexus.peernexus.answer.dto.AnswerResponse;
import com.peernexus.peernexus.answer.dto.AnswerUpdateRequest;
import com.peernexus.peernexus.answer.dto.VoteRequest;

public interface AnswerService {

    AnswerResponse create(AnswerCreateRequest request);

    AnswerResponse update(Long id, AnswerUpdateRequest request);

    void delete(Long id);

    AnswerResponse getById(Long id);

    Page<AnswerResponse> getByDoubt(Long doubtId, Pageable pageable);

    AnswerResponse acceptAnswer(Long id);

    AnswerResponse vote(Long id, VoteRequest request);
}
