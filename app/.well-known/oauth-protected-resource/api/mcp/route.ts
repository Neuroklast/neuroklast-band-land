import { protectedMcpResourceMetadata } from '@/lib/mcp/protected-resource-metadata'

// Both RFC 9728 discovery paths resolve to the same canonical MCP resource.
export const dynamic = 'force-dynamic'
export const GET = protectedMcpResourceMetadata
