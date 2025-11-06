export type Bowler = {
  bowlerId: number;
  isDelete: boolean;
  bowlerLastName: string;
  bowlerFirstName: string;
  bowlerMiddleInit: string | null;
  bowlerAddress: string;
  bowlerCity: string;
  bowlerState: string;
  bowlerZip: number;
  bowlerPhoneNumber: string;
  teamId: number;
  team: {
    teamID: number;
    teamName: string;
  };
};
