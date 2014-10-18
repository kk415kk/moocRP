var path = require('path');

module.exports.paths = {
    
    // Visualization Paths
    UPLOAD_PATH: path.resolve('..', 'visualizations', 'archives'),
    EXTRACT_PATH: path.resolve('..', 'visualizations', 'tmp'),
    PUBLIC_SHARE_PATH: path.resolve('views', 'analytics', 'share'),

    // Stored Scaffolds Folder
    STORED_SCAFFOLDS_PATH: path.resolve('assets', 'scaffolds'),

    // Assets Folder
    ANALYTICS_ASSETS_PATH: path.join('assets', 'analytics'),
    ANALYTICS_REWRITE_PATH: '../../../../../analytics',

    // Dataset Paths
    DATASET_ROOT: path.resolve('..', 'datasets'),
    DATASET_DOWNLOAD_ROOT: path.resolve('..', 'datasets', 'available'),
    DATASET_NON_PII: path.resolve('..', 'datasets', 'available', 'non_pii'),
    DATASET_PII: path.resolve('..', 'datasets', 'available', 'pii'),
    DATASET_EXTRACT_PATH: path.resolve('..', 'datasets', 'extracted'),
    DATASET_ENCRYPT_PATH: path.resolve('..', 'datasets', 'encrypted')

    // Public Key Paths
}