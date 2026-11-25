import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Stats Instagram toutes les 3 heures (gratuit : connexion Instagram de l'équipe Treg).
 * Assez souvent pour relever les « vues à 48 h » au plus près des 48 h.
 */
crons.interval("synchro instagram", { hours: 3 }, internal.instagram.synchroniserAuto, {});

export default crons;
