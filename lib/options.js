const PLATFORMS = {
    aws: {
        types: {
            "default": {},
            "edge-origin-request": {},
            "edge-origin-response": {},
            "edge-viewer-request": {},
            "edge-viewer-response": {}
        }
    }
}

const defaultOptions = {
    platform: "aws",
    type: "default",
    requestId: 'x-request-id'
};

module.exports = function(opts) {
    let options = Object.assign({}, defaultOptions, opts);
    let platform = options.platform;
    let platformType = options.type;
    if (typeof platform !== "string") {
        throw new Error(`options.platform is required and must be a string; you passed ${typeof platform}`);
    }
    if (typeof platformType !== "string") {
        throw new Error(`options.type is required and must be a string; you passed ${typeof platformType}`);
    }
    let validPlatforms = Object.keys(PLATFORMS);
    if (!validPlatforms.includes(platform)) {
        throw new Error(`Invalid value for options.platform: ${platform}; must be one of: ${validPlatforms.join(", ")}`);
    }
    let validPlatformTypes = Object.keys(PLATFORMS[platform].types);
    if (!validPlatformTypes.includes(platformType)) {
        throw new Error(`Invalid value for options.type "${platformType}" for options.platform "${platform}"; must be one of: ${validPlatformTypes.join(", ")}`);
    }
    return { options };
}