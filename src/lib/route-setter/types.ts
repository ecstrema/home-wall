export type HoldType = 'start' | 'normal' | 'end';

export type RouteHold = {
	type: HoldType;
	target: string;
};

export type Boulder = {
	name: string;
	grade: string;
	holds: RouteHold[];
};
