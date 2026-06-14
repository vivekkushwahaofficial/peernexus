package com.peernexus.peernexus.auth.service;

import com.peernexus.peernexus.auth.entity.RefreshToken;
import com.peernexus.peernexus.user.entity.User;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user);

    RefreshToken verifyExpiration(RefreshToken token);

    void deleteByUser(User user);
}
