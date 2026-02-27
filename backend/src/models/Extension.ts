import mongoose, { Document, Schema } from 'mongoose';

export interface IFinding {
  type: 'permission' | 'host-permission' | 'code-pattern' | 'deprecated' | 'info' | 'content-script' | 'csp' | 'sensitive-domain' | 'permission-combo';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'good';
  description: string;
  permission?: string;
  pattern?: string;
  file?: string;
  value?: string;
  domains?: string[];
}

export interface IExtension extends Document {
  extensionId: string;
  name: string;
  version: string;
  manifest: Record<string, any>;
  permissions: string[];
  findings: IFinding[];
  score: number;
  sourceUrl?: string;
  embeddedUrls: string[];
  storeMetadata?: Record<string, any>;
  aiAnalysis?: { summary: string; riskLevel: string };
  scannedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const extensionSchema = new Schema<IExtension>(
  {
    extensionId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      default: 'Unknown'
    },
    version: {
      type: String,
      default: '0.0.0'
    },
    manifest: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    permissions: {
      type: [String],
      default: []
    },
    findings: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    sourceUrl: {
      type: String,
      default: null
    },
    embeddedUrls: {
      type: [String],
      default: []
    },
    storeMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    scannedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'extensions'
  }
);

extensionSchema.index({ extensionId: 1, scannedAt: -1 });

export default mongoose.model<IExtension>('Extension', extensionSchema);