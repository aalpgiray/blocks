export type IValue =
  | number
  | {
      valueOf(): number;
    };
