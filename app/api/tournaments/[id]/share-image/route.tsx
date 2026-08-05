import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getTournamentById, getTournamentStats } from "@/lib/db";
import { getLeaders, BYE_LEADER_ID } from "@/lib/leaders";
import { getTournamentTypeIcon, type Round } from "@/models/tournament";
import type { Leader } from "@/models/leader";

interface Params {
  id: string;
}

// Flat, plain design (no card/box chrome): column headers (COIN/START/RESULT)
// are printed once, rounds below are a simple aligned array of values.
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

// Same win/loss palette used elsewhere in the app (RoundList's result cards).
const WIN_BG = "#f0fdf4"; // Tailwind green-50
const LOSS_BG = "#fef2f2"; // Tailwind red-50

// Single-column round row layout.
const ROUND_NUMBER_WIDTH = 40;
const ROUND_IMAGE_WIDTH = 96;
const ROUND_IMAGE_HEIGHT = 132;
const ROUND_IMAGE_GAP = 20;
const ROUND_ROW_PADDING_X = 20;
const ROUND_VALUE_FONT_SIZE = 28;
const ROUND_NUMBER_FONT_SIZE = 22;
const COLUMN_LABEL_FONT_SIZE = 20;

// Compact (2-column) round row layout — smaller so two fit side by side.
const COMPACT_ROUND_ROW_HEIGHT = 112;
const COMPACT_ROUND_NUMBER_WIDTH = 32;
const COMPACT_ROUND_IMAGE_WIDTH = 72;
const COMPACT_ROUND_IMAGE_HEIGHT = 99;
const COMPACT_ROUND_IMAGE_GAP = 12;
const COMPACT_ROUND_ROW_PADDING_X = 12;
const COMPACT_ROUND_VALUE_FONT_SIZE = 18;
const COMPACT_ROUND_NUMBER_FONT_SIZE = 16;
const COMPACT_COLUMN_LABEL_FONT_SIZE = 14;

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
      <div
        style={{
          display: "flex",
          fontSize: 30,
          fontWeight: 700,
          color: color ?? "#0f172a",
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", fontSize: 22, color: "#94a3b8" }}>
        {label}
      </div>
    </div>
  );
}

function ResultValue({
  value,
  good,
  neutral,
  fontSize,
}: {
  value: string;
  good?: boolean;
  neutral?: boolean;
  fontSize: number;
}) {
  const color = neutral ? "#475569" : good ? "#15803d" : "#b91c1c";
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        justifyContent: "center",
        fontSize,
        fontWeight: 700,
        color,
      }}
    >
      {value}
    </div>
  );
}

function ColumnHeaderRow({ compact }: { compact: boolean }) {
  const numberWidth = compact ? COMPACT_ROUND_NUMBER_WIDTH : ROUND_NUMBER_WIDTH;
  const imageWidth = compact ? COMPACT_ROUND_IMAGE_WIDTH : ROUND_IMAGE_WIDTH;
  const gap = compact ? COMPACT_ROUND_IMAGE_GAP : ROUND_IMAGE_GAP;
  const paddingX = compact ? COMPACT_ROUND_ROW_PADDING_X : ROUND_ROW_PADDING_X;
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
      <div style={{ display: "flex", flex: 1, gap: "12px" }}>
        {["COIN", "START", "RESULT"].map((label) => (
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
  const valueFontSize = compact
    ? COMPACT_ROUND_VALUE_FONT_SIZE
    : ROUND_VALUE_FONT_SIZE;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: `${rowHeight}px`,
        backgroundColor: round.won ? WIN_BG : LOSS_BG,
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
      <div style={{ display: "flex", flex: 1, gap: "12px" }}>
        <ResultValue
          value={round.wonCoinFlip ? "W" : "L"}
          good={round.wonCoinFlip}
          fontSize={valueFontSize}
        />
        <ResultValue
          value={round.startingPosition}
          neutral
          fontSize={valueFontSize}
        />
        <ResultValue
          value={round.won ? "W" : "L"}
          good={round.won}
          fontSize={valueFontSize}
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
              <div style={{ display: "flex", gap: "28px", marginTop: "auto" }}>
                <Stat label="rounds" value={String(stats.totalRounds)} />
                <Stat label="wins" value={String(stats.wins)} color="#15803d" />
                <Stat
                  label="losses"
                  value={String(stats.losses)}
                  color="#b91c1c"
                />
                <Stat
                  label="win rate"
                  value={`${stats.winRate}%`}
                  color="#b45309"
                />
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
