const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    originalText: {
        type: String,
        required: true
    },
    brailleText: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['en', 'hi', 'ta', 'te', 'bn', 'gu', 'kn', 'ml', 'mr', 'or', 'pa', 'ur']
    },
    grade: {
        type: String,
        enum: ['grade1', 'grade2'],
        default: 'grade1'
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.8
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String
    }
}, {
    timestamps: true
});

// Index for better query performance
translationSchema.index({ user: 1, createdAt: -1 });
translationSchema.index({ document: 1 });
translationSchema.index({ language: 1, grade: 1 });

module.exports = mongoose.model('Translation', translationSchema);
