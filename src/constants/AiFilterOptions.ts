export type AiPersonOption = {
  name: string;
  role: 'Athlete' | 'Photographer';
  location?: string;
};

export type AiGroupOption = {
  name: string;
  location?: string;
};

export const AI_PEOPLE: AiPersonOption[] = [
  {name: 'James Ray', role: 'Athlete', location: 'Dhaka'},
  {name: 'Sofia Klein', role: 'Athlete', location: 'Berlin'},
  {name: 'Greg Reynders', role: 'Athlete', location: 'Hasselt'},
  {name: 'Liam Carter', role: 'Photographer', location: 'Brussels'},
  {name: 'Emma Novak', role: 'Photographer', location: 'Gent'},
];

export const AI_GROUPS: AiGroupOption[] = [
  {name: 'Olympic Track Club', location: 'Brussels'},
  {name: 'Marathon Pacers', location: 'Gent'},
];
