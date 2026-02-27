import { Request, Response } from 'express';
import Extension from '../models/Extension';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        // Run all aggregations in parallel
        const [totalScans, uniqueExtensions, riskDistribution, topExtensions, recentScans, avgScoreResult] =
            await Promise.all([
                // Total scan count
                Extension.countDocuments(),

                // Unique extension IDs
                Extension.distinct('extensionId').then(ids => ids.length),

                // Risk level distribution (based on score ranges)
                Extension.aggregate([
                    {
                        $group: {
                            _id: '$extensionId',
                            latestScore: { $last: '$score' },
                            latestName: { $last: '$name' }
                        }
                    },
                    {
                        $project: {
                            riskLevel: {
                                $switch: {
                                    branches: [
                                        { case: { $lte: ['$latestScore', 0] }, then: 'CRITICAL' },
                                        { case: { $lt: ['$latestScore', 25] }, then: 'HIGH' },
                                        { case: { $lt: ['$latestScore', 50] }, then: 'MEDIUM' },
                                        { case: { $lt: ['$latestScore', 75] }, then: 'LOW' },
                                    ],
                                    default: 'SAFE'
                                }
                            }
                        }
                    },
                    { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ]),

                // Top extensions by scan frequency
                Extension.aggregate([
                    {
                        $group: {
                            _id: '$extensionId',
                            name: { $last: '$name' },
                            latestScore: { $last: '$score' },
                            scanCount: { $sum: 1 },
                            lastScanned: { $max: '$scannedAt' },
                            storeMetadata: { $last: '$storeMetadata' }
                        }
                    },
                    { $sort: { scanCount: -1 } },
                    { $limit: 10 },
                    {
                        $project: {
                            extensionId: '$_id',
                            name: 1,
                            score: '$latestScore',
                            scanCount: 1,
                            lastScanned: 1,
                            icon: '$storeMetadata.icon',
                            author: '$storeMetadata.author'
                        }
                    }
                ]),

                // Recent scans (latest 10)
                Extension.find()
                    .sort({ scannedAt: -1 })
                    .limit(10)
                    .select('extensionId name score scannedAt storeMetadata')
                    .lean(),

                // Average score
                Extension.aggregate([
                    {
                        $group: {
                            _id: '$extensionId',
                            avgScore: { $avg: '$score' }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            averageScore: { $avg: '$avgScore' }
                        }
                    }
                ])
            ]);

        // Format risk distribution
        const riskMap: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, SAFE: 0 };
        riskDistribution.forEach((r: { _id: string; count: number }) => {
            riskMap[r._id] = r.count;
        });

        // Format recent scans
        const formattedRecent = recentScans.map((s: any) => ({
            extensionId: s.extensionId,
            name: s.name,
            score: s.score,
            scannedAt: s.scannedAt,
            icon: s.storeMetadata?.icon || null,
            riskLevel: s.score >= 75 ? 'SAFE' : s.score >= 50 ? 'LOW' : s.score >= 25 ? 'MEDIUM' : s.score > 0 ? 'HIGH' : 'CRITICAL'
        }));

        res.status(200).json({
            stats: {
                totalScans,
                uniqueExtensions,
                averageScore: Math.round(avgScoreResult[0]?.averageScore || 0)
            },
            riskDistribution: riskMap,
            topExtensions,
            recentScans: formattedRecent,
            generatedAt: new Date().toISOString()
        });
    } catch (err) {
        console.error('❌ Dashboard error:', err instanceof Error ? err.message : 'Unknown');
        res.status(500).json({
            error: 'Failed to load dashboard data',
            message: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
