export const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInHours = Math.floor(diffInSeconds / 3600);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 3600) return "just a moments ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return "yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return "recently";
};