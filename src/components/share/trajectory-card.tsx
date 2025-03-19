import React from "react";
import clsx from "clsx";

interface TrajectoryTempateProps {
  children: React.ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
}

interface TrajectoryCardType extends React.FC<TrajectoryTempateProps> {
  Header: React.FC<TrajectoryCardHeaderProps>;
  Body: React.FC<TrajectoryCardBodyProps>;
}

export const TrajectoryCard: TrajectoryCardType = ({ children, className }) => {
  return (
    <section
      className={clsx(
        "w-full max-w-[1000px] rounded-md",
        className,
      )}
    >
      {children}
    </section>
  );
};

interface TrajectoryCardHeaderProps {
  children: string;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
}

const TrajectoryCardHeader: React.FC<TrajectoryCardHeaderProps> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        "rounded-t-md p-2",
        className,
      )}
    >
      <span className="font-semibold">{children}</span>
    </div>
  );
}

interface TrajectoryCardBodyProps {
  children: React.ReactNode;
}

const TrajectoryCardBody: React.FC<TrajectoryCardBodyProps> = ({ children }) => {
  return (
    <div className="p-2 flex flex-col gap-4 overflow-auto">
      {React.Children.map(children, (child, index) => {
        if (typeof child === "string") return <div key={index}>{child}</div>;
        return child;
      })}
    </div>
  );
};

TrajectoryCard.Header = TrajectoryCardHeader;
TrajectoryCard.Body = TrajectoryCardBody;