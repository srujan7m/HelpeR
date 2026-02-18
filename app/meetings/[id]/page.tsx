import MeetingRoom from "@/components/MeetingRoom";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface MeetingPageProps {
    params: Promise<{ id: string }>;
}

export default async function MeetingPage({ params }: MeetingPageProps) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
        redirect("/sign-in");
    }

    return <MeetingRoom meetingId={id} userId={userId} />;
}
