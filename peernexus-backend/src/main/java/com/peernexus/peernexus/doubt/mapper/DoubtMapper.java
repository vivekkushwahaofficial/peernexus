package com.peernexus.peernexus.doubt.mapper;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.peernexus.peernexus.doubt.dto.CategoryResponse;
import com.peernexus.peernexus.doubt.dto.DoubtImageResponse;
import com.peernexus.peernexus.doubt.dto.DoubtResponse;
import com.peernexus.peernexus.doubt.dto.UserSummary;
import com.peernexus.peernexus.doubt.entity.Category;
import com.peernexus.peernexus.doubt.entity.Doubt;
import com.peernexus.peernexus.doubt.entity.DoubtImage;
import com.peernexus.peernexus.doubt.entity.Tag;
import com.peernexus.peernexus.user.entity.User;

@Mapper(componentModel = "spring")
public interface DoubtMapper {

    @Mapping(target = "category", expression = "java(toCategory(doubt.getCategory()))")
    @Mapping(target = "author", expression = "java(toUserSummary(doubt.getAuthor()))")
    @Mapping(target = "tags", expression = "java(toTagNames(doubt.getTags()))")
    @Mapping(target = "images", expression = "java(toImageResponses(doubt.getImages()))")
    DoubtResponse toResponse(Doubt doubt);

    default CategoryResponse toCategory(Category category) {
        if (category == null) {
            return null;
        }
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }

    default UserSummary toUserSummary(User user) {
        if (user == null) {
            return null;
        }
        return UserSummary.builder()
                .id(user.getId())
                .name(user.getName())
                .role(user.getRole())
                .verified(user.isVerified())
                .build();
    }

    default List<String> toTagNames(Set<Tag> tags) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }
        return tags.stream()
                .map(Tag::getName)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }

    default List<DoubtImageResponse> toImageResponses(Set<DoubtImage> images) {
        if (images == null || images.isEmpty()) {
            return List.of();
        }
        List<DoubtImage> ordered = new ArrayList<>(images);
        ordered.sort(Comparator.comparing(DoubtImage::getId, Comparator.nullsLast(Long::compareTo)));
        return ordered.stream()
                .map(image -> DoubtImageResponse.builder()
                .id(image.getId())
                .url(image.getUrl())
                .build())
                .toList();
    }
}
