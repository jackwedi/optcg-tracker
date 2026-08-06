import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getTournamentById, getTournamentStats } from "@/lib/db";
import { getLeaders, BYE_LEADER_ID } from "@/lib/leaders";
import { getTournamentTypeIcon, type Round } from "@/models/tournament";
import type { Leader } from "@/models/leader";
import { getShortLeaderName } from "@/lib/utils";
import { colorToHex } from "@/components/LeaderColorDots";

interface Params {
  id: string;
}

// Flat, plain design (no card/box chrome): column headers (COIN FLIP/START/
// RESULT) are printed once, rounds below are a simple aligned array of values.
// Height always fits the actual content exactly — no artificial minimum,
// so there's never a blank gap below the last round.
// Rendered at 2x pixel density (same layout/proportions as before, every
// dimension doubled) so it looks sharp on high-DPI phone screens.
const CARD_WIDTH = 1120;
const OUTER_PADDING = 40;
const HEADER_HEIGHT = 220;
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

// Rows no longer wash the whole card in green/red — the badges below carry
// the win/loss signal, matching RoundList's table (a full-row tint read as
// "weird"/noisy there once badges took over that job).
const ROW_BG = "#f8fafc"; // Tailwind slate-50

// Same badge palette as RoundList's table: solid circle + letter, not color
// alone, so each column stays legible and distinct from the others.
const BADGE_WON = { bg: "#10b981", color: "#ffffff" }; // emerald-500
const BADGE_LOST = { bg: "#ef4444", color: "#ffffff" }; // red-500
const BADGE_COIN_WON = { bg: "#f59e0b", color: "#ffffff" }; // amber-500
const BADGE_COIN_LOST = { bg: "#e2e8f0", color: "#64748b" }; // slate-200/500
const BADGE_START = { bg: "#0ea5e9", color: "#ffffff" }; // sky-500
const BADGE_BYE = { bg: "#94a3b8", color: "#ffffff" }; // slate-400
const BADGE_NA = { bg: "#f1f5f9", color: "#94a3b8" }; // slate-100/400

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

// Win-rate meter used in the header — mirrors the tournament detail page's
// amber progress bar + won/lost record line (StatMeter-style). Uses solid
// color dots instead of emoji: emoji glyphs Satori can't resolve locally
// fall back to a network font fetch that can hang or fail (see the badge
// text below), so new elements here stay emoji-free on principle.
const METER_TRACK = "#fef3c7"; // amber-100
const METER_FILL = "#f59e0b"; // amber-500
const METER_VALUE_COLOR = "#d97706"; // amber-600

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

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: `${rowHeight}px`,
        backgroundColor: ROW_BG,
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

    const [leaders, stats] = await Promise.all([
      getLeaders(),
      getTournamentStats(id),
    ]);

    const leadersById = Object.fromEntries(leaders.map((l) => [l.id, l]));
    const playedLeader = tournament.playedLeaderId
      ? leadersById[tournament.playedLeaderId]
      : undefined;

    const placeholderUrl = new URL("/placeholder.png", request.url).toString();

    const hasRounds = tournament.rounds.length > 0;
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
            paddingBottom: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "24px" }}>
            <img
              src={playedLeader ? playedLeader.imageUrl : placeholderUrl}
              alt={playedLeader ? playedLeader.name : "No leader set"}
              width={112}
              height={156}
              style={{ borderRadius: "12px", objectFit: "cover" }}
            />
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 40,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {tournament.name}
                </div>
                <div style={{ display: "flex", fontSize: 32 }}>
                  {getTournamentTypeIcon(tournament.tournamentType)}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  color: "#64748b",
                  marginTop: "4px",
                }}
              >
                {playedLeader ? playedLeader.name : "No leader set"}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: "#64748b",
                    }}
                  >
                    Win Rate
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 34,
                      fontWeight: 700,
                      color: METER_VALUE_COLOR,
                    }}
                  >
                    {stats.winRate}%
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "14px",
                    borderRadius: "9999px",
                    backgroundColor: METER_TRACK,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: `${Math.min(100, Math.max(0, Number(stats.winRate)))}%`,
                      height: "100%",
                      borderRadius: "9999px",
                      backgroundColor: METER_FILL,
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    fontSize: 22,
                    color: "#64748b",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: "14px",
                        height: "14px",
                        borderRadius: "9999px",
                        backgroundColor: BADGE_WON.bg,
                      }}
                    />
                    <div style={{ display: "flex" }}>{stats.wins} won</div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: "14px",
                        height: "14px",
                        borderRadius: "9999px",
                        backgroundColor: BADGE_LOST.bg,
                      }}
                    />
                    <div style={{ display: "flex" }}>{stats.losses} lost</div>
                  </div>
                  <div style={{ display: "flex" }}>
                    {stats.totalRounds} round
                    {stats.totalRounds === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
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
