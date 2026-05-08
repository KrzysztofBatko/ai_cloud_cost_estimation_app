"use client";

import { Mail, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/app/(auth-users)/profile/hooks/useProfile";
import DescriptionRow from "@/app/(auth-users)/profile/components/DescriptionRow";
import DeleteAccount from "@/app/(auth-users)/profile/components/DeleteAccount";

function getInitial(name: string) {
  return name.charAt(0).toUpperCase() || "U";
}

export default function ProfileDetails() {
  const { profile } = useProfile();

  return (
    <Card className="mt-6 shadow-card">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.image ?? undefined} alt={profile.name} />
            <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
              {getInitial(profile.name)}
            </AvatarFallback>
          </Avatar>

          <dl className="grid gap-4">
            <DescriptionRow
              Icon={UserRound}
              label="User name"
              value={profile.name}
            />
            <DescriptionRow Icon={Mail} label="Email" value={profile.email} />
          </dl>
        </div>

        <DeleteAccount />
      </CardContent>
    </Card>
  );
}
