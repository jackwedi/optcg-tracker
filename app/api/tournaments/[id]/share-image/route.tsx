import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getTournamentById, getTournamentStats } from "@/lib/db";
import { getLeaders, BYE_LEADER_ID } from "@/lib/leaders";
import { getMetaById } from "@/lib/meta";
import { getTournamentTypeIcon, type Round } from "@/models/tournament";
import type { Leader } from "@/models/leader";
import { getShortLeaderName } from "@/lib/utils";
import { colorToHex } from "@/components/LeaderColorDots";

interface Params {
  id: string;
}

// Same numeric M/D/YYYY format as the tournament detail page's
// formatDateServer, so the shared image reads identically to the page.
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString + "T00:00:00Z");
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

// Flat, plain design (no card/box chrome): column headers (COIN FLIP/START/
// RESULT) are printed once, rounds below are a simple aligned array of values.
// Height always fits the actual content exactly — no artificial minimum,
// so there's never a blank gap below the last round.
// Rendered at 2x pixel density (same layout/proportions as before, every
// dimension doubled) so it looks sharp on high-DPI phone screens.
const CARD_WIDTH = 1120;
const OUTER_PADDING = 40;
// Header mirrors the tournament detail page's current layout exactly:
// title+date, meta+type pills below it, then leader (image+color bar+name)
// paired with a Record card (score, mini streak, coin flip rate) — this
// replaced the page's older fixed-photo + win-rate-meter design a while
// back, and the shared image had drifted out of sync with it since.
const HEADER_TITLE_ROW_HEIGHT = 56;
const HEADER_BADGE_ROW_HEIGHT = 40;
const HEADER_TITLE_TO_BADGES_GAP = 10;
const HEADER_BADGES_TO_BODY_GAP = 24;
// Native ~264:367 leader-card ratio (uncropped, objectFit "contain" as a
// fallback for any leader art that isn't exactly that ratio) — matches the
// page's leader image, which stopped cropping to a fixed box.
const HEADER_LEADER_IMAGE_WIDTH = 140;
const HEADER_LEADER_IMAGE_HEIGHT = 195;
const HEADER_LEADER_NAME_HEIGHT = 34;
const HEADER_LEADER_NAME_GAP = 10;
const HEADER_BODY_ROW_HEIGHT =
  HEADER_LEADER_IMAGE_HEIGHT +
  HEADER_LEADER_NAME_GAP +
  HEADER_LEADER_NAME_HEIGHT;
const HEADER_BOTTOM_PADDING = 24;
const HEADER_HEIGHT =
  HEADER_TITLE_ROW_HEIGHT +
  HEADER_TITLE_TO_BADGES_GAP +
  HEADER_BADGE_ROW_HEIGHT +
  HEADER_BADGES_TO_BODY_GAP +
  HEADER_BODY_ROW_HEIGHT +
  HEADER_BOTTOM_PADDING;
const HEADER_TO_ROUNDS_GAP = 16;
const COLUMN_HEADER_HEIGHT = 44;
const ROUND_ROW_HEIGHT = 152;
const ROUND_ROW_GAP = 16;
const EMPTY_ROUNDS_HEIGHT = 80;
const FOOTER_HEIGHT = 56;
const COLUMN_GAP = 32;

// More than this many rounds splits into 2 side-by-side columns so the
// image doesn't grow excessively tall.
const TWO_COLUMN_THRESHOLD = 5;

// Bye rows stay neutral (RoundList's bye rows have no persistent tint
// either, only a hover state, which a static image can't show). Win/loss
// rows get the same faint tint as RoundList's resting (non-hover) rows —
// bg-emerald-500/5 and bg-red-500/5 — so the image's row hues match what
// the app actually shows, not the flat neutral this used to render.
const ROW_BG = "#f8fafc"; // Tailwind slate-50
const ROW_BG_WON = "rgba(16, 185, 129, 0.05)"; // emerald-500 @ 5%
const ROW_BG_LOST = "rgba(239, 68, 68, 0.05)"; // red-500 @ 5%

// Same badge palette as RoundList's table: solid circle + letter, not color
// alone, so each column stays legible and distinct from the others.
const BADGE_WON = { bg: "#10b981", color: "#ffffff" }; // emerald-500
const BADGE_LOST = { bg: "#ef4444", color: "#ffffff" }; // red-500
const BADGE_COIN_WON = { bg: "#f59e0b", color: "#ffffff" }; // amber-500
const BADGE_COIN_LOST = { bg: "#e2e8f0", color: "#64748b" }; // slate-200/500
// Start's real values (1st/2nd) use the same slate-400/white as Bye badges
// — that's what RoundList.tsx actually renders (bg-slate-400 text-white
// for both), not the sky-500 this used to show.
const BADGE_START = { bg: "#94a3b8", color: "#ffffff" }; // slate-400
const BADGE_BYE = { bg: "#94a3b8", color: "#ffffff" }; // slate-400
const BADGE_NA = { bg: "#f1f5f9", color: "#94a3b8" }; // slate-100/400

// Record card's mini streak — same colors as the page's, most recent
// rounds only (oldest to newest, left to right).
const MAX_STREAK_ROUNDS = 10;
const STREAK_DOT_DIAMETER = 14;
const STREAK_DOT_GAP = 6;
const STREAK_BYE_COLOR = "#cbd5e1"; // slate-300

// Single-column round row layout.
const ROUND_NUMBER_WIDTH = 40;
const ROUND_IMAGE_WIDTH = 96;
const ROUND_IMAGE_HEIGHT = 132;
const ROUND_IMAGE_GAP = 20;
const ROUND_ROW_PADDING_X = 20;
const ROUND_BADGE_DIAMETER = 56;
const ROUND_BADGE_FONT_SIZE = 24;
const ROUND_NUMBER_FONT_SIZE = 22;
const ROUND_NAME_FONT_SIZE = 26;
const ROUND_COLOR_BAR_WIDTH = 8;
const ROUND_NAME_COLUMN_WIDTH = 220;
const COLUMN_LABEL_FONT_SIZE = 20;

// Compact (2-column) round row layout — smaller so two fit side by side.
const COMPACT_ROUND_ROW_HEIGHT = 112;
const COMPACT_ROUND_NUMBER_WIDTH = 32;
const COMPACT_ROUND_IMAGE_WIDTH = 72;
const COMPACT_ROUND_IMAGE_HEIGHT = 99;
const COMPACT_ROUND_IMAGE_GAP = 12;
const COMPACT_ROUND_ROW_PADDING_X = 12;
const COMPACT_ROUND_BADGE_DIAMETER = 40;
const COMPACT_ROUND_BADGE_FONT_SIZE = 16;
const COMPACT_ROUND_NAME_FONT_SIZE = 16;
const COMPACT_ROUND_COLOR_BAR_WIDTH = 6;
const COMPACT_ROUND_NAME_COLUMN_WIDTH = 120;
const COMPACT_ROUND_NUMBER_FONT_SIZE = 16;
const COMPACT_COLUMN_LABEL_FONT_SIZE = 14;

function BadgeValue({
  value,
  bg,
  color,
  fontSize,
  diameter,
}: {
  value: string;
  bg: string;
  color: string;
  fontSize: number;
  diameter: number;
}) {
  return (
    <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: `${diameter}px`,
          height: `${diameter}px`,
          borderRadius: "9999px",
          backgroundColor: bg,
          color,
          fontSize,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ColumnHeaderRow({ compact }: { compact: boolean }) {
  const numberWidth = compact ? COMPACT_ROUND_NUMBER_WIDTH : ROUND_NUMBER_WIDTH;
  const imageWidth = compact ? COMPACT_ROUND_IMAGE_WIDTH : ROUND_IMAGE_WIDTH;
  const gap = compact ? COMPACT_ROUND_IMAGE_GAP : ROUND_IMAGE_GAP;
  const paddingX = compact ? COMPACT_ROUND_ROW_PADDING_X : ROUND_ROW_PADDING_X;
  const nameColumnWidth = compact
    ? COMPACT_ROUND_NAME_COLUMN_WIDTH
    : ROUND_NAME_COLUMN_WIDTH;
  const fontSize = compact
    ? COMPACT_COLUMN_LABEL_FONT_SIZE
    : COLUMN_LABEL_FONT_SIZE;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: `${COLUMN_HEADER_HEIGHT}px`,
        padding: `0 ${paddingX}px`,
        gap: `${gap}px`,
      }}
    >
      <div style={{ display: "flex", width: `${numberWidth}px` }} />
      <div style={{ display: "flex", width: `${imageWidth}px` }} />
      {/* Mirrors RoundRow's name+color column exactly, so the badge
          columns after it line up with these labels. */}
      <div style={{ display: "flex", width: `${nameColumnWidth}px` }} />
      <div style={{ display: "flex", flex: 1, gap: "12px" }}>
        {["COIN FLIP", "START", "RESULT"].map((label) => (
          <div
            key={label}
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              fontSize,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "#94a3b8",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function RoundRow({
  round,
  index,
  leadersById,
  placeholderUrl,
  compact,
}: {
  round: Round;
  index: number;
  leadersById: Record<string, Leader>;
  placeholderUrl: string;
  compact: boolean;
}) {
  const isBye = round.opponentLeaderId === BYE_LEADER_ID;
  const opponent = isBye ? undefined : leadersById[round.opponentLeaderId];

  const rowHeight = compact ? COMPACT_ROUND_ROW_HEIGHT : ROUND_ROW_HEIGHT;
  const numberWidth = compact ? COMPACT_ROUND_NUMBER_WIDTH : ROUND_NUMBER_WIDTH;
  const imageWidth = compact ? COMPACT_ROUND_IMAGE_WIDTH : ROUND_IMAGE_WIDTH;
  const imageHeight = compact ? COMPACT_ROUND_IMAGE_HEIGHT : ROUND_IMAGE_HEIGHT;
  const gap = compact ? COMPACT_ROUND_IMAGE_GAP : ROUND_IMAGE_GAP;
  const paddingX = compact ? COMPACT_ROUND_ROW_PADDING_X : ROUND_ROW_PADDING_X;
  const numberFontSize = compact
    ? COMPACT_ROUND_NUMBER_FONT_SIZE
    : ROUND_NUMBER_FONT_SIZE;
  const badgeFontSize = compact
    ? COMPACT_ROUND_BADGE_FONT_SIZE
    : ROUND_BADGE_FONT_SIZE;
  const badgeDiameter = compact
    ? COMPACT_ROUND_BADGE_DIAMETER
    : ROUND_BADGE_DIAMETER;
  const nameFontSize = compact
    ? COMPACT_ROUND_NAME_FONT_SIZE
    : ROUND_NAME_FONT_SIZE;
  const colorBarWidth = compact
    ? COMPACT_ROUND_COLOR_BAR_WIDTH
    : ROUND_COLOR_BAR_WIDTH;
  const nameColumnWidth = compact
    ? COMPACT_ROUND_NAME_COLUMN_WIDTH
    : ROUND_NAME_COLUMN_WIDTH;

  const opponentName = isBye
    ? "BYE"
    : getShortLeaderName(opponent?.name ?? round.opponentLeaderId);
  const opponentColors = Array.isArray(opponent?.colors)
    ? opponent.colors.flat().filter(Boolean)
    : [];

  // Same badge text/colors as RoundList's table, so the shared image and
  // the live page always read as one consistent system.
  const resultBadge = isBye ? BADGE_BYE : round.won ? BADGE_WON : BADGE_LOST;
  const resultText = isBye ? "B" : round.won ? "W" : "L";
  const coinFlipBadge = isBye
    ? BADGE_NA
    : round.wonCoinFlip
      ? BADGE_COIN_WON
      : BADGE_COIN_LOST;
  // Plain ASCII only — Satori has to fall back to a dynamic Google Fonts
  // fetch for glyphs missing from its bundled font (e.g. "✕", en dash),
  // and that fetch can fail (seen a 400 in testing), breaking the whole
  // image. Letters/digits/hyphen are covered by the base font, no fetch.
  const coinFlipText = isBye ? "-" : round.wonCoinFlip ? "B" : "X";
  const startBadge = isBye ? BADGE_NA : BADGE_START;
  const startText = isBye ? "-" : round.startingPosition === "1st" ? "1" : "2";
  const rowBackground = isBye ? ROW_BG : round.won ? ROW_BG_WON : ROW_BG_LOST;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: `${rowHeight}px`,
        backgroundColor: rowBackground,
        borderRadius: "16px",
        padding: `0 ${paddingX}px`,
        gap: `${gap}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          width: `${numberWidth}px`,
          fontSize: numberFontSize,
          color: "#94a3b8",
          fontWeight: 700,
        }}
      >
        R{index + 1}
      </div>
      <img
        src={isBye ? placeholderUrl : (opponent?.imageUrl ?? placeholderUrl)}
        alt={isBye ? "BYE" : (opponent?.name ?? "Unknown leader")}
        width={imageWidth}
        height={imageHeight}
        style={{ borderRadius: "10px", objectFit: "cover" }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: `${gap}px`,
          width: `${nameColumnWidth}px`,
        }}
      >
        {opponentColors.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: `${colorBarWidth}px`,
              height: `${imageHeight * 0.6}px`,
              borderRadius: "9999px",
              overflow: "hidden",
            }}
          >
            {opponentColors.slice(0, 2).map((color) => (
              <div
                key={color}
                style={{
                  display: "flex",
                  flex: 1,
                  backgroundColor: colorToHex(color),
                }}
              />
            ))}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            flex: 1,
            fontSize: nameFontSize,
            fontWeight: 700,
            color: "#0f172a",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {opponentName}
        </div>
      </div>
      <div style={{ display: "flex", flex: 1, gap: "12px" }}>
        <BadgeValue
          value={coinFlipText}
          bg={coinFlipBadge.bg}
          color={coinFlipBadge.color}
          fontSize={badgeFontSize}
          diameter={badgeDiameter}
        />
        <BadgeValue
          value={startText}
          bg={startBadge.bg}
          color={startBadge.color}
          fontSize={badgeFontSize}
          diameter={badgeDiameter}
        />
        <BadgeValue
          value={resultText}
          bg={resultBadge.bg}
          color={resultBadge.color}
          fontSize={badgeFontSize}
          diameter={badgeDiameter}
        />
      </div>
    </div>
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;
    const tournament = await getTournamentById(id);

    if (!tournament) {
      return new Response("Tournament not found", { status: 404 });
    }

    const [leaders, stats, meta] = await Promise.all([
      getLeaders(),
      getTournamentStats(id),
      tournament.metaId
        ? getMetaById(tournament.metaId)
        : Promise.resolve(undefined),
    ]);

    const leadersById = Object.fromEntries(leaders.map((l) => [l.id, l]));
    const playedLeader = tournament.playedLeaderId
      ? leadersById[tournament.playedLeaderId]
      : undefined;
    const playedLeaderColors = Array.isArray(playedLeader?.colors)
      ? playedLeader.colors.flat().filter(Boolean)
      : [];

    const placeholderUrl = new URL("/placeholder.png", request.url).toString();

    const hasRounds = tournament.rounds.length > 0;
    const streakRounds = tournament.rounds.slice(-MAX_STREAK_ROUNDS);
    const coinFlipWinRate =
      stats.totalRounds > 0
        ? Math.round((stats.coinFlipWins / stats.totalRounds) * 100)
        : 0;
    const useTwoColumns = tournament.rounds.length > TWO_COLUMN_THRESHOLD;
    const itemsPerColumn = useTwoColumns
      ? Math.ceil(tournament.rounds.length / 2)
      : tournament.rounds.length;
    const rowHeightForCalc = useTwoColumns
      ? COMPACT_ROUND_ROW_HEIGHT
      : ROUND_ROW_HEIGHT;
    const roundsHeight = hasRounds
      ? itemsPerColumn * rowHeightForCalc + (itemsPerColumn - 1) * ROUND_ROW_GAP
      : EMPTY_ROUNDS_HEIGHT;
    const contentHeight =
      OUTER_PADDING * 2 +
      HEADER_HEIGHT +
      (hasRounds ? HEADER_TO_ROUNDS_GAP + COLUMN_HEADER_HEIGHT : 0) +
      roundsHeight +
      FOOTER_HEIGHT;
    const height = contentHeight;

    const firstColumnCount = Math.ceil(tournament.rounds.length / 2);
    const firstColumnRounds = useTwoColumns
      ? tournament.rounds.slice(0, firstColumnCount)
      : tournament.rounds;
    const secondColumnRounds = useTwoColumns
      ? tournament.rounds.slice(firstColumnCount)
      : [];

    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
          padding: `${OUTER_PADDING}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: `${HEADER_HEIGHT}px`,
            borderBottom: "2px solid #e2e8f0",
            paddingBottom: `${HEADER_BOTTOM_PADDING}px`,
          }}
        >
          {/* Title + date, same line, mirrors the page's h1+date row. */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              height: `${HEADER_TITLE_ROW_HEIGHT}px`,
            }}
          >
            <div
              style={{
                display: "flex",
                flex: 1,
                fontSize: 40,
                fontWeight: 700,
                color: "#0f172a",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {tournament.name}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                color: "#64748b",
                whiteSpace: "nowrap",
              }}
            >
              {formatDate(tournament.date)}
            </div>
          </div>

          {/* Meta + tournament type pills, mirrors the page's row directly
              below the title. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              height: `${HEADER_BADGE_ROW_HEIGHT}px`,
              marginTop: `${HEADER_TITLE_TO_BADGES_GAP}px`,
            }}
          >
            {meta ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "9999px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  padding: "6px 16px",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                {meta.extensions.join(" / ")}
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "9999px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                padding: "6px 16px",
                fontSize: 18,
                fontWeight: 600,
                color: "#475569",
              }}
            >
              <div style={{ display: "flex", fontSize: 18 }}>
                {getTournamentTypeIcon(tournament.tournamentType)}
              </div>
              <div style={{ display: "flex" }}>{tournament.tournamentType}</div>
            </div>
          </div>

          {/* Played leader (image + color bar, name below) paired with the
              Record card — mirrors the page's leader/record row exactly,
              including the mini streak and coin-flip win rate. */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: "24px",
              marginTop: `${HEADER_BADGES_TO_BODY_GAP}px`,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: `${HEADER_LEADER_NAME_GAP}px`,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "stretch", gap: "10px" }}
              >
                <img
                  src={playedLeader ? playedLeader.imageUrl : placeholderUrl}
                  alt={playedLeader ? playedLeader.name : "No leader set"}
                  width={HEADER_LEADER_IMAGE_WIDTH}
                  height={HEADER_LEADER_IMAGE_HEIGHT}
                  style={{
                    borderRadius: "10px",
                    objectFit: "contain",
                    backgroundColor: "#f8fafc",
                  }}
                />
                {playedLeaderColors.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "8px",
                      borderRadius: "9999px",
                      overflow: "hidden",
                    }}
                  >
                    {playedLeaderColors.slice(0, 2).map((color) => (
                      <div
                        key={color}
                        style={{
                          display: "flex",
                          flex: 1,
                          backgroundColor: colorToHex(color),
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <div
                style={{
                  display: "flex",
                  width: `${HEADER_LEADER_IMAGE_WIDTH}px`,
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#334155",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {playedLeader
                  ? getShortLeaderName(playedLeader.name)
                  : "No leader set"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                backgroundColor: ROW_BG,
                padding: "20px 28px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#64748b",
                }}
              >
                Record
              </div>
              {hasRounds ? (
                // A real div, not a Fragment — Satori doesn't lay Fragment
                // children out as flex items of the column parent the way
                // a browser would, so the score/streak/coin-flip rows
                // collapsed onto one horizontal line without this wrapper.
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "10px",
                      fontSize: 44,
                      fontWeight: 700,
                      color: "#0f172a",
                      marginTop: "6px",
                    }}
                  >
                    <div style={{ display: "flex" }}>{stats.wins}</div>
                    <div
                      style={{
                        display: "flex",
                        fontSize: 20,
                        color: "#94a3b8",
                      }}
                    >
                      W
                    </div>
                    <div style={{ display: "flex", color: "#cbd5e1" }}>-</div>
                    <div style={{ display: "flex" }}>{stats.losses}</div>
                    <div
                      style={{
                        display: "flex",
                        fontSize: 20,
                        color: "#94a3b8",
                      }}
                    >
                      L
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: `${STREAK_DOT_GAP}px`,
                      marginTop: "10px",
                    }}
                  >
                    {tournament.rounds.length > streakRounds.length ? (
                      <div
                        style={{
                          display: "flex",
                          fontSize: 16,
                          color: "#94a3b8",
                        }}
                      >
                        ...
                      </div>
                    ) : null}
                    {streakRounds.map((round) => {
                      const isByeRound =
                        round.opponentLeaderId === BYE_LEADER_ID;
                      const dotColor = isByeRound
                        ? STREAK_BYE_COLOR
                        : round.won
                          ? BADGE_WON.bg
                          : BADGE_LOST.bg;
                      return (
                        <div
                          key={round.id}
                          style={{
                            display: "flex",
                            width: `${STREAK_DOT_DIAMETER}px`,
                            height: `${STREAK_DOT_DIAMETER}px`,
                            borderRadius: "9999px",
                            backgroundColor: dotColor,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 16,
                      color: "#94a3b8",
                      marginTop: "8px",
                    }}
                  >
                    Coin flip {coinFlipWinRate}% won
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    fontSize: 20,
                    color: "#94a3b8",
                    marginTop: "6px",
                  }}
                >
                  No rounds yet
                </div>
              )}
            </div>
          </div>
        </div>

        {!hasRounds ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: `${EMPTY_ROUNDS_HEIGHT}px`,
              color: "#94a3b8",
              fontSize: 26,
            }}
          >
            No rounds recorded yet
          </div>
        ) : useTwoColumns ? (
          <div
            style={{
              display: "flex",
              gap: `${COLUMN_GAP}px`,
              marginTop: `${HEADER_TO_ROUNDS_GAP}px`,
            }}
          >
            {[firstColumnRounds, secondColumnRounds].map(
              (columnRounds, columnIndex) => (
                <div
                  key={columnIndex}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <ColumnHeaderRow compact />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: `${ROUND_ROW_GAP}px`,
                    }}
                  >
                    {columnRounds.map((round, localIndex) => (
                      <RoundRow
                        key={round.id}
                        round={round}
                        index={
                          columnIndex === 0
                            ? localIndex
                            : firstColumnCount + localIndex
                        }
                        leadersById={leadersById}
                        placeholderUrl={placeholderUrl}
                        compact
                      />
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: `${HEADER_TO_ROUNDS_GAP}px`,
            }}
          >
            <ColumnHeaderRow compact={false} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: `${ROUND_ROW_GAP}px`,
              }}
            >
              {tournament.rounds.map((round, index) => (
                <RoundRow
                  key={round.id}
                  round={round}
                  index={index}
                  leadersById={leadersById}
                  placeholderUrl={placeholderUrl}
                  compact={false}
                />
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: `${FOOTER_HEIGHT}px`,
            fontSize: 22,
            color: "#94a3b8",
          }}
        >
          One Piece TCG Tracker
        </div>
      </div>,
      {
        width: CARD_WIDTH,
        height,
      },
    );
  } catch {
    return new Response("Failed to generate share image", { status: 500 });
  }
}
