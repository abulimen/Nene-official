const uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'NO_FILE',
                message: 'No image file uploaded'
            }
        });
    }

    // Return the path to the uploaded file
    // In production, this would be a full URL or CDN link
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
        success: true,
        data: {
            url: imageUrl,
            filename: req.file.filename
        }
    });
};

module.exports = {
    uploadImage
};
