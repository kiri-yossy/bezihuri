import React, { useState } from 'react';
import { fetchApi } from '../apiClient';
import { useToast } from '../context/ToastContext';
import { Button } from './Button';

interface FollowButtonProps {
  targetUserId: number;
  initialIsFollowing: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ targetUserId, initialIsFollowing }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleFollowToggle = async () => {
    setIsLoading(true);
    const method = isFollowing ? 'DELETE' : 'POST';
    try {
      await fetchApi(`/api/users/${targetUserId}/follow`, { method });
      setIsFollowing(!isFollowing);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '操作に失敗しました。', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleFollowToggle} disabled={isLoading}>
      {isFollowing ? 'フォロー中' : 'フォローする'}
    </Button>
  );
};