package com.peernexus.peernexus.doubt.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.peernexus.peernexus.doubt.entity.Tag;

public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByNameIgnoreCase(String name);
}
