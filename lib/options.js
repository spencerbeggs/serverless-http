const PLATFORMS = {
    aws: {
        types: {
            "default": {},
            "edge-origin-request": {
                "compress": [
                    "application/javascript",
                    "application/json",
                    "application/octet-stream",
                    "application/xml",
                    "font/eot",
                    "font/opentype",
                    "font/otf",
                    "image/jpeg",
                    "image/png",
                    "image/svg+xml",
                    "text/comma-separated-values",
                    "text/css",
                    "text/html",
                    "text/javascript",
                    "text/plain",
                    "text/text",
                    "text/xml"
                ]
            },
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

module.exports = function(opts = {}) {
    if (Object.keys(opts).includes("platform") && typeof opts.platform !== "string") {
        throw new Error(`options.platform is required and must be a string; you passed ${typeof platform}`);
    }
    if (Object.keys(opts).includes("type") && typeof opts.type !== "string") {
        throw new Error(`options.type is required and must be a string; you passed ${typeof platform}`);
    }
    let validPlatforms = Object.keys(PLATFORMS);
    if (Object.keys(opts).includes("platform") && !validPlatforms.includes(opts.platform)) {
        throw new Error(`Invalid value for options.platform: ${platform}; must be one of: ${validPlatforms.join(", ")}`);
    }
    let options = Object.assign({}, defaultOptions, opts);
    let { platform, type: platformType } = options;
    options = Object.assign({}, PLATFORMS[platform].types[platformType], options);
    let typeOptions = Object.assign({}, options);
    delete typeOptions.platform;
    delete typeOptions.type;
    delete typeOptions.requestId;
    let validPlatformTypes = Object.keys(PLATFORMS[platform].types);
    if (!validPlatformTypes.includes(platformType)) {
        throw new Error(`Invalid value for options.type "${platformType}" for options.platform "${platform}"; must be one of: ${validPlatformTypes.join(", ")}`);
    }
    let validEdgeOriginRequestOptions = Object.keys(PLATFORMS[platform].types[platformType]).concat(["request", "response"]);
    Object.keys(typeOptions).forEach(optionKey => {
        if (!validEdgeOriginRequestOptions.includes(optionKey)) {
            throw new Error(`Invalid option "${optionKey}" for options.platform "${platform}" and options.type "${platformType}"; valid options are: ${validEdgeOriginRequestOptions.join(", ")}`);
        }
    });
    if (platform === "aws" && platformType === "edge-origin-request") {
        if ((typeof typeOptions.compress === "boolean" && typeOptions.compress !== false) || !Array.isArray(typeOptions.compress)) {
            throw new Error(`Invalid type for options.compress "${typeOptions.compress}"; must be [String] or false.`);
        }
    }
    return options;
}