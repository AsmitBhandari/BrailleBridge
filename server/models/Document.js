const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Document title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    originalFile: {
        filename: {
            type: String,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        mimetype: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        }
    },
    extractedText: {
        type: String,
        default: ''
    },
    brailleTranslation: {
        content: {
            type: String,
            default: ''
        },
        grade: {
            type: String,
            enum: ['grade1', 'grade2'],
            default: 'grade1'
        },
        language: {
            type: String,
            default: 'en'
        }
    },
    audioFile: {
        filename: {
            type: String
        },
        path: {
            type: String
        },
        duration: {
            type: Number
        }
    },
    status: {
        type: String,
        enum: ['uploaded', 'processing', 'completed', 'failed'],
        default: 'uploaded'
    },
    processingSteps: {
        ocr: {
            completed: { type: Boolean, default: false },
            timestamp: Date,
            error: String
        },
        braille: {
            completed: { type: Boolean, default: false },
            timestamp: Date,
            error: String
        },
        audio: {
            completed: { type: Boolean, default: false },
            timestamp: Date,
            error: String
        }
    },
    metadata: {
        pageCount: Number,
        wordCount: Number,
        characterCount: Number,
        processingTime: Number
    }
}, {
    timestamps: true
});

// Index for better query performance
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ status: 1 });

module.exports = mongoose.model('Document', documentSchema);
