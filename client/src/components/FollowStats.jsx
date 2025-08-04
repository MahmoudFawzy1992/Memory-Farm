export default function FollowStats({ showFollowList, followStats }) {
  if (!showFollowList) return null;

  const { followers = 0, following = 0 } = followStats || {};

  const hasNoStats = followers === 0 && following === 0;

  return (
    <div className="flex gap-6 mb-4 text-sm text-gray-600">
      {hasNoStats ? (
        <span className="italic text-gray-400">
          No followers or following yet.
        </span>
      ) : (
        <>
          <span>👥 {followers} follower{followers !== 1 ? "s" : ""}</span>
          <span>➡️ following {following}</span>
        </>
      )}
    </div>
  );
}
