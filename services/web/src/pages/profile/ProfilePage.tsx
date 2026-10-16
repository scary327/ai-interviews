import { ProfileCard } from "@/modules/profile";
import { PageHeader } from "@/shared/components/PageHeader";

export const ProfilePage = () => (
    <div className="mx-auto max-w-xl space-y-6">
        <PageHeader title="Профиль" />
        <ProfileCard />
    </div>
);
