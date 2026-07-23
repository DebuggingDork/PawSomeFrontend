import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldOff, User as UserIcon } from 'lucide-react'
import { listBlocks, removeBlock } from '@/lib/api/blocks'

export function BlockedUsersTab() {
  const queryClient = useQueryClient()
  const blocksQuery = useQuery({ queryKey: ['blocks'], queryFn: listBlocks })

  const removeMutation = useMutation({
    mutationFn: removeBlock,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blocks'] }),
  })

  if (blocksQuery.isLoading) return <div className="h-32 animate-pulse rounded-2xl bg-neutral-900/60" />

  const blocks = blocksQuery.data?.blocks ?? []

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center text-neutral-500">
        <ShieldOff className="mb-3 h-9 w-9" />
        <p className="font-medium text-neutral-300">No blocked users</p>
        <p className="text-sm">Anyone you block will be listed here so you can unblock them later.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {blocks.map((block) => (
        <li
          key={block.id}
          className="flex items-center gap-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3"
        >
          {block.blocked_user.profile_photo_url ? (
            <img src={block.blocked_user.profile_photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800">
              <UserIcon className="h-4 w-4 text-neutral-600" />
            </div>
          )}
          <p className="flex-1 truncate font-medium text-white">{block.blocked_user.full_name ?? 'Unknown user'}</p>
          <button
            onClick={() => removeMutation.mutate(block.id)}
            disabled={removeMutation.isPending}
            className="rounded-full border border-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:border-[#ff6b35] hover:text-white disabled:opacity-50"
          >
            Unblock
          </button>
        </li>
      ))}
    </ul>
  )
}
