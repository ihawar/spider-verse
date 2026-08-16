import { toPersianDateParts } from "../../utils/formatTime";

export default function FigureDisplay() {
  const { day, month, year } = toPersianDateParts(new Date());

  return (
    <div className="flex flex-col items-start select-none h-full justify-between py-4">
      <div className="text-left">
        <p className="text-2xl font-semibold text-zinc-600 tracking-widest leading-none">
          {year}
        </p>
        <p className="text-7xl font-bold text-white tracking-wide leading-tight mt-1">
          {day} {month}
        </p>
      </div>

      <div className="relative flex-1 flex items-center justify-center w-full">
        <div className="absolute inset-0 bg-[var(--color-spider-red)]/5 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[var(--color-spider-red)]/3 blur-[100px] rounded-full" />
        <img
          src="/figure.png"
          alt="Spider-Verse"
          className="relative w-full max-h-[calc(100vh-340px)] h-auto object-contain drop-shadow-[0_0_60px_rgba(227,54,63,0.25)] drop-shadow-[0_0_120px_rgba(227,54,63,0.1)]"
          draggable={false}
        />
      </div>
    </div>
  );
}
