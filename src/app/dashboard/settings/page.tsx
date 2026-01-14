'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userService, subscriptionService } from '@/services';
import { getAssetUrl } from '@/lib/api';
import type { ProfileResponse, SubscriptionHistoryEntry } from '@/types';
import {
  User,
  Crown,
  Zap,
  Calendar,
  Coins,
  TrendingUp,
  Flame,
  FileText,
  Users,
  Award,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  Edit3,
  Save,
  X,
  Loader2,
  LogOut
} from 'lucide-react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [history, setHistory] = useState<SubscriptionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Edit mode state
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profileData, historyData] = await Promise.all([
        userService.getProfile(),
        subscriptionService.getHistory()
      ]);
      setProfile(profileData);
      setHistory(historyData.history);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle size={16} className={styles.iconActive} />;
      case 'Cancelled':
      case 'Expired':
        return <XCircle size={16} className={styles.iconCancelled} />;
      case 'GracePeriod':
        return <AlertCircle size={16} className={styles.iconGrace} />;
      default:
        return <Clock size={16} className={styles.iconPending} />;
    }
  };

  // Username editing functions
  const handleEditUsername = () => {
    setNewUsername(profile?.username || '');
    setUsernameError('');
    setIsEditingUsername(true);
  };

  const handleCancelEdit = () => {
    setIsEditingUsername(false);
    setNewUsername('');
    setUsernameError('');
  };

  const validateUsername = (username: string): string | null => {
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 30) return 'Username must be less than 30 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Only letters, numbers, and underscores allowed';
    return null;
  };

  const handleUsernameChange = (value: string) => {
    setNewUsername(value);
    const validationError = validateUsername(value);

    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    setUsernameError('');
  };

  const handleSaveUsername = async () => {
    if (usernameError || !newUsername || newUsername === profile?.username) return;

    setIsSaving(true);
    try {
      const result = await userService.updateProfile(newUsername);
      setProfile(prev => prev ? { ...prev, username: result.username } : prev);
      setIsEditingUsername(false);
      setSaveSuccess('Username updated successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update username';
      setUsernameError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar upload functions
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, GIF, and WebP images are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploadingAvatar(true);
    setError('');
    try {
      const result = await userService.updateProfile(undefined, file);
      setProfile(prev => prev ? { ...prev, avatarUrl: result.avatarUrl } : prev);
      setAvatarPreview(null); // Clear preview to show server URL
      setSaveSuccess('Avatar updated successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(errorMessage);
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Profile Settings</h1>
        <p className={styles.subtitle}>Manage your account and view your stats</p>
      </div>

      {error && !profile && (
        <div className={styles.error}>
          <AlertCircle size={48} />
          <p>{error || 'Failed to load profile'}</p>
        </div>
      )}

      {/* Success Message */}
      {saveSuccess && (
        <div className={styles.successMessage}>
          <CheckCircle size={16} />
          {saveSuccess}
        </div>
      )}

      {/* Profile Card */}
      <div className={styles.profileCard}>
        {isLoading ? (
          <div className={styles.profileCardSkeleton}>
            <div className={styles.skeletonAvatar}></div>
            <div className={styles.skeletonInfo}>
              <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
              <div className={styles.skeletonLine} style={{ width: '40%' }}></div>
              <div className={styles.skeletonLine} style={{ width: '50%' }}></div>
            </div>
          </div>
        ) : profile ? (
          <>
            <div className={styles.profileHeader}>
              <div className={styles.avatarSection}>
                {/* Avatar with edit button */}
                <div className={styles.avatarWrapper}>
                  <div className={styles.avatar} onClick={handleAvatarClick}>
                    {isUploadingAvatar ? (
                      <div className={styles.avatarLoading}>
                        <Loader2 size={24} className={styles.spinnerIcon} />
                      </div>
                    ) : avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" />
                    ) : profile.avatarUrl ? (
                      <img src={getAssetUrl(profile.avatarUrl)} alt="Avatar" />
                    ) : (
                      <User size={40} />
                    )}
                  </div>
                  <button className={styles.avatarEditBtn} onClick={handleAvatarClick} disabled={isUploadingAvatar}>
                    <Camera size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className={styles.hiddenInput}
                  />
                </div>

                <div className={styles.userInfo}>
                  {/* Username with edit */}
                  <div className={styles.usernameSection}>
                    {isEditingUsername ? (
                      <div className={styles.usernameEdit}>
                        <div className={styles.usernameInputWrapper}>
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            className={`${styles.usernameInput} ${usernameError ? styles.inputError : ''}`}
                            placeholder="Enter username"
                            maxLength={30}
                          />
                        </div>
                        {usernameError && <p className={styles.errorText}>{usernameError}</p>}
                        <div className={styles.editActions}>
                          <button
                            className={styles.saveBtn}
                            onClick={handleSaveUsername}
                            disabled={!!usernameError || isSaving || newUsername === profile.username}
                          >
                            {isSaving ? <Loader2 size={14} className={styles.spinnerIcon} /> : <Save size={14} />}
                            Save
                          </button>
                          <button className={styles.cancelBtn} onClick={handleCancelEdit} disabled={isSaving}>
                            <X size={14} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.nameRow}>
                        <div className={styles.usernameWithEdit}>
                          <h2 className={styles.username}>{profile.username}</h2>
                          <button className={styles.editBtn} onClick={handleEditUsername}>
                            <Edit3 size={14} />
                          </button>
                        </div>
                        <div className={`${styles.tierBadge} ${profile.isPro ? styles.proBadge : styles.freeBadge}`}>
                          {profile.isPro ? <Crown size={14} /> : <Zap size={14} />}
                          <span>{profile.tier}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className={styles.email}>{profile.email}</p>
                  <p className={styles.memberSince}>
                    <Calendar size={14} />
                    Member since {formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            {profile.isPro && (
          <div className={styles.subscriptionStatus}>
            <div className={styles.subscriptionInfo}>
              <Crown size={20} className={styles.proIcon} />
              <div>
                <p className={styles.subscriptionTitle}>Pro Subscription</p>
                <p className={styles.subscriptionDetail}>
                  {profile.subscriptionStatus === 'Active'
                    ? `Renews on ${formatDate(profile.subscriptionExpiresAt)}`
                    : profile.subscriptionStatus === 'Cancelled'
                    ? `Access until ${formatDate(profile.subscriptionExpiresAt)}`
                    : profile.subscriptionStatus
                  }
                </p>
              </div>
            </div>
          </div>
            )}
          </>
        ) : null}
      </div>

      {/* Stats Grid */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIndicator}></span>
        <h2 className={styles.sectionTitle}>Your Stats</h2>
      </div>

      {isLoading ? (
        <div className={styles.statsGridSkeleton}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={styles.statCardSkeleton}>
              <div className={styles.skeletonIcon}></div>
              <div className={styles.skeletonStatInfo}>
                <div className={styles.skeletonLine} style={{ width: '50%' }}></div>
                <div className={styles.skeletonLine} style={{ width: '70%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : profile ? (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.balanceIcon}`}>
              <Coins size={20} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statValue}>{profile.balance}</p>
              <p className={styles.statLabel}>Broins Balance</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.levelIcon}`}>
              <TrendingUp size={20} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statValue}>Level {profile.level}</p>
              <p className={styles.statLabel}>{profile.experience} XP</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.streakIcon}`}>
              <Flame size={20} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statValue}>{profile.currentStreak} days</p>
            <p className={styles.statLabel}>Current Streak</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.longestIcon}`}>
            <Flame size={20} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{profile.longestStreak} days</p>
            <p className={styles.statLabel}>Longest Streak</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.docsIcon}`}>
            <FileText size={20} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{profile.totalDocuments}</p>
            <p className={styles.statLabel}>Documents</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.referralsIcon}`}>
            <Users size={20} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{profile.totalReferrals}</p>
            <p className={styles.statLabel}>Referrals</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.badgesIcon}`}>
            <Award size={20} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statValue}>{profile.badgesEarned}</p>
            <p className={styles.statLabel}>Badges Earned</p>
          </div>
        </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.activityIcon}`}>
              <Clock size={20} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statValue}>{formatDate(profile.lastActivityDate)}</p>
              <p className={styles.statLabel}>Last Active</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Subscription History */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIndicator}></span>
        <h2 className={styles.sectionTitle}>Subscription History</h2>
      </div>

      <div className={styles.historySection}>
        {history.length === 0 ? (
          <div className={styles.emptyHistory}>
            <CreditCard size={48} />
            <p>No subscription history yet</p>
            <span>Your subscription payments will appear here</span>
          </div>
        ) : (
          <div className={styles.historyList}>
            {history.map((entry) => (
              <div key={entry.id} className={styles.historyItem}>
                <div className={styles.historyIcon}>
                  {getStatusIcon(entry.status)}
                </div>
                <div className={styles.historyContent}>
                  <div className={styles.historyMain}>
                    <p className={styles.historyTitle}>
                      Pro Subscription
                      {entry.totalRenewals > 0 && (
                        <span className={styles.renewalBadge}>
                          {entry.totalRenewals} renewal{entry.totalRenewals > 1 ? 's' : ''}
                        </span>
                      )}
                    </p>
                    <p className={styles.historyDate}>
                      {formatDate(entry.currentPeriodStart)} - {formatDate(entry.currentPeriodEnd)}
                    </p>
                  </div>
                  <div className={styles.historyMeta}>
                    <span className={`${styles.historyStatus} ${styles[`status${entry.status}`]}`}>
                      {entry.status}
                    </span>
                    <span className={styles.historyAmount}>${entry.amountUSD.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sign Out Button - Desktop Only */}
      <button className={styles.desktopLogoutBtn} onClick={handleLogoutClick}>
        <LogOut size={20} />
        <span>Sign Out</span>
      </button>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={handleLogoutCancel}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleLogoutCancel}>
              <X size={20} />
            </button>
            <div className={styles.modalIcon}>
              <LogOut size={32} />
            </div>
            <h3 className={styles.modalTitle}>Sign Out?</h3>
            <p className={styles.modalText}>
              Are you sure you want to sign out of your account?
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={handleLogoutCancel}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
