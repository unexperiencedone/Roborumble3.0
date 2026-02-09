import mongoose from "mongoose";
import Team from "@/app/models/Team";
import Event from "@/app/models/Event";
import { IRegistration } from "@/app/models/Registration";
import { IProfile } from "@/app/models/Profile";

/**
 * Populates denormalized fields on a Registration document.
 * Call this when creating or updating a registration to cache
 * frequently-accessed data and avoid expensive populate() calls.
 * 
 * @example
 * const registration = new Registration({ teamId, eventId, selectedMembers });
 * await denormalizeRegistration(registration);
 * await registration.save();
 */
export async function denormalizeRegistration(
    registration: IRegistration
): Promise<IRegistration> {
    const [team, event] = await Promise.all([
        registration.teamId
            ? Team.findById(registration.teamId).populate<{ leaderId: IProfile }>('leaderId', 'firstName lastName email')
            : null,
        Event.findById(registration.eventId).select('title slug'),
    ]);

    const leader = team?.leaderId as IProfile | undefined;

    registration._denormalized = {
        teamName: team?.name ?? 'Individual',
        eventTitle: event?.title ?? '',
        eventSlug: event?.slug ?? '',
        leaderName: leader ? `${leader.firstName ?? ''} ${leader.lastName ?? ''}`.trim() : '',
        leaderEmail: leader?.email ?? '',
        memberCount: registration.selectedMembers?.length ?? 0,
    };

    return registration;
}

/**
 * Batch denormalize multiple registrations efficiently.
 * Uses aggregation to minimize database round trips.
 */
export async function denormalizeRegistrations(
    registrations: IRegistration[]
): Promise<IRegistration[]> {
    if (registrations.length === 0) return registrations;

    // Collect unique IDs
    const teamIds = registrations
        .map(r => r.teamId?.toString())
        .filter((id): id is string => id !== undefined);
    const uniqueTeamIds = [...new Set(teamIds)];

    const eventIdStrings = registrations
        .map(r => r.eventId?.toString())
        .filter((id): id is string => id !== undefined);
    const uniqueEventIds = [...new Set(eventIdStrings)];

    // Batch fetch teams with leaders
    const teams = await Team.find({ _id: { $in: uniqueTeamIds } })
        .populate<{ leaderId: IProfile }>('leaderId', 'firstName lastName email')
        .lean();

    const teamMap = new Map(teams.map(t => [t._id.toString(), t]));

    // Batch fetch events
    const events = await Event.find({ _id: { $in: uniqueEventIds } })
        .select('title slug')
        .lean();

    const eventMap = new Map(events.map(e => [e._id.toString(), e]));

    // Apply denormalized data
    for (const registration of registrations) {
        const team = registration.teamId ? teamMap.get(registration.teamId.toString()) : null;
        const event = eventMap.get(registration.eventId.toString());
        const leader = team?.leaderId as IProfile | undefined;

        registration._denormalized = {
            teamName: team?.name ?? 'Individual',
            eventTitle: event?.title ?? '',
            eventSlug: event?.slug ?? '',
            leaderName: leader ? `${leader.firstName ?? ''} ${leader.lastName ?? ''}`.trim() : '',
            leaderEmail: leader?.email ?? '',
            memberCount: registration.selectedMembers?.length ?? 0,
        };
    }

    return registrations;
}
