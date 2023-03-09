export const jerseySchema = {
  jerseyKey: { type: 'keyword' },
  jerseyPrimaryColor: { type: 'keyword' },
  jerseySecondaryColor: { type: 'keyword' },
  logo: { type: 'keyword' },
  boathouseId: { type: 'keyword' },
  id: { type: 'keyword' },
  userId: { type: 'keyword' },
};

export interface JerseyInternal {
  jerseyKey: string;
  jerseyPrimaryColor: string;
  jerseySecondaryColor: string;
  logo: string;
  boathouseId: string;
  id: string;
  userId: string;
}

export type CreateJerseyPayload = Exclude<JerseyInternal, 'id'>;
