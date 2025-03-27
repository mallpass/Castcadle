package com.castcadle.data;

import com.castcadle.model.UserGameData;
import java.util.HashMap;
import java.util.Map;

public class UserGameDataRepository {
    // In-memory store: maps userId to their game data.
    private static Map<String, UserGameData> userData = new HashMap<>();

    public static UserGameData getUserGameData(String userId) {
        if (!userData.containsKey(userId)) {
            userData.put(userId, new UserGameData(userId));
        }
        return userData.get(userId);
    }
}
