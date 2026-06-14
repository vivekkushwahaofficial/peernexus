package com.peernexus.peernexus.doubt.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peernexus.peernexus.doubt.dto.DoubtCreateRequest;
import com.peernexus.peernexus.doubt.dto.DoubtImageUploadRequest;
import com.peernexus.peernexus.doubt.dto.DoubtResponse;
import com.peernexus.peernexus.doubt.dto.DoubtUpdateRequest;
import com.peernexus.peernexus.doubt.entity.Category;
import com.peernexus.peernexus.doubt.entity.Doubt;
import com.peernexus.peernexus.doubt.entity.DoubtImage;
import com.peernexus.peernexus.doubt.entity.DoubtStatus;
import com.peernexus.peernexus.doubt.entity.Tag;
import com.peernexus.peernexus.doubt.mapper.DoubtMapper;
import com.peernexus.peernexus.doubt.repository.CategoryRepository;
import com.peernexus.peernexus.doubt.repository.DoubtImageRepository;
import com.peernexus.peernexus.doubt.repository.DoubtRepository;
import com.peernexus.peernexus.doubt.repository.TagRepository;
import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.exception.UnauthorizedException;
import com.peernexus.peernexus.user.entity.User;
import com.peernexus.peernexus.user.repository.UserRepository;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoubtServiceImpl implements com.peernexus.peernexus.doubt.service.DoubtService {

    private final DoubtRepository doubtRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final DoubtImageRepository doubtImageRepository;
    private final UserRepository userRepository;
    private final DoubtMapper doubtMapper;

    @Override
    @Transactional
    public DoubtResponse create(DoubtCreateRequest request) {
        User author = resolveCurrentUser();
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Doubt doubt = Doubt.builder()
                .title(request.title())
                .content(request.content())
                .status(DoubtStatus.OPEN)
                .category(category)
                .author(author)
                .build();

        if (request.tagNames() != null) {
            doubt.setTags(resolveTags(request.tagNames()));
        }

        Doubt saved = doubtRepository.save(doubt);

        if (request.imageUrls() != null) {
            attachImages(saved, request.imageUrls());
        }

        return doubtMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public DoubtResponse update(Long id, DoubtUpdateRequest request) {
        Doubt doubt = getOwnedDoubt(id);

        if (Objects.nonNull(request.title())) {
            doubt.setTitle(request.title());
        }
        if (Objects.nonNull(request.content())) {
            doubt.setContent(request.content());
        }
        if (Objects.nonNull(request.categoryId())) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            doubt.setCategory(category);
        }
        if (Objects.nonNull(request.tagNames())) {
            doubt.setTags(resolveTags(request.tagNames()));
        }
        if (Objects.nonNull(request.imageUrls())) {
            doubt.getImages().clear();
            attachImages(doubt, request.imageUrls());
        }

        return doubtMapper.toResponse(doubtRepository.save(doubt));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Doubt doubt = getOwnedDoubt(id);
        doubtRepository.delete(doubt);
    }

    @Override
    @Transactional(readOnly = true)
    public DoubtResponse getById(Long id) {
        Doubt doubt = doubtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doubt not found"));
        return doubtMapper.toResponse(doubt);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoubtResponse> getAll(Pageable pageable) {
        return doubtRepository.findAllWithAuthorAndCategory(pageable).map(doubtMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoubtResponse> search(String query, Pageable pageable) {
        return doubtRepository.search(query, pageable).map(doubtMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoubtResponse> getByCategory(Long categoryId, Pageable pageable) {
        return doubtRepository.findByCategoryId(categoryId, pageable).map(doubtMapper::toResponse);
    }

    @Override
    @Transactional
    public DoubtResponse addImages(Long id, DoubtImageUploadRequest request) {
        Doubt doubt = getOwnedDoubt(id);
        attachImages(doubt, request.imageUrls());
        return doubtMapper.toResponse(doubtRepository.save(doubt));
    }

    private User resolveCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl details) {
            return userRepository.findById(details.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new UnauthorizedException("Unauthorized");
    }

    private Doubt getOwnedDoubt(Long id) {
        Doubt doubt = doubtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doubt not found"));
        User currentUser = resolveCurrentUser();
        if (!doubt.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        return doubt;
    }

    private Set<Tag> resolveTags(List<String> names) {
        Set<Tag> tags = new HashSet<>();
        for (String name : names) {
            String normalized = name.trim().toLowerCase();
            Tag tag = tagRepository.findByNameIgnoreCase(normalized)
                    .orElseGet(() -> tagRepository.save(Tag.builder().name(normalized).build()));
            tags.add(tag);
        }
        return tags;
    }

    private void attachImages(Doubt doubt, List<String> imageUrls) {
        if (imageUrls == null) {
            return;
        }
        for (String url : imageUrls) {
            DoubtImage image = DoubtImage.builder()
                    .doubt(doubt)
                    .url(url)
                    .build();
            doubt.getImages().add(image);
        }
        doubtImageRepository.saveAll(doubt.getImages());
    }
}
