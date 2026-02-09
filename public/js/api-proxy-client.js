/**
 * API Proxy Helper - Cloudflare Function Integration
 * Handles communication with the Cloudflare Function API Proxy
 */

class APIProxyClient {
  constructor(proxyUrl) {
    this.proxyUrl = proxyUrl || 'https://craftersmc-guides.pages.dev';
    this.cache = new Map();
    this.cacheDuration = {
      bazaar: 30000,      // 30 seconds for bazaar data
      player: 300000,     // 5 minutes for player data
      profile: 300000     // 5 minutes for profile data
    };
  }

  /**
   * Update API configuration
   */
  setConfig(proxyUrl) {
    this.proxyUrl = proxyUrl || this.proxyUrl;
  }

  /**
   * Check if request is cached and still valid
   */
  getFromCache(cacheKey, type = 'bazaar') {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const duration = this.cacheDuration[type] || 30000;
    if (Date.now() - cached.timestamp < duration) {
      console.log(`Cache hit for ${cacheKey}`);
      return cached.data;
    }

    this.cache.delete(cacheKey);
    return null;
  }

  /**
   * Store data in cache
   */
  setCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Make a request to the API Proxy
   */
  async makeRequest(endpoint, options = {}) {
    const baseUrl = this.proxyUrl.replace(/\/$/, '');
    const url = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get bazaar item details
   */
  async getBazaarItem(itemId) {
    // Check cache first
    const cached = this.getFromCache(itemId, 'bazaar');
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/bazaar/${itemId}`);
      this.setCache(itemId, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch bazaar data for ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Get player data
   */
  async getPlayer(username) {
    // Check cache first
    const cached = this.getFromCache(username, 'player');
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/player/${username}`);
      this.setCache(username, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch player data for ${username}:`, error);
      throw error;
    }
  }

  /**
   * Get profile data
   */
  async getProfile(profileId) {
    // Check cache first
    const cached = this.getFromCache(profileId, 'profile');
    if (cached) return cached;

    try {
      const data = await this.makeRequest(`/profile/${profileId}`);
      this.setCache(profileId, data);
      return data;
    } catch (error) {
      console.error(`Failed to fetch profile data for ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(cacheKey) {
    this.cache.delete(cacheKey);
  }
}

// Export for use in both modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIProxyClient;
}
