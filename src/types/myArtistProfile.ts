import { ArtistDetail } from './artist';
import { Album } from './album';
import { Concert } from './concert';

export interface MyArtistProfileResponse {
  isExists: boolean;
  artist?: ArtistDetail;
  albums?: Album[];
  concerts?: Concert[];
}
