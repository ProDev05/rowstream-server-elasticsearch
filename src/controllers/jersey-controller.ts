import { NextFunction, Response } from 'express';
import { readDirectory, readSvg } from '../util/file';

import { CustomRequest } from '../models/request';
import {
  createJersey,
  matchJersey,
  retrieveJersey,
  updateJersey,
  deleteJersey
} from '../services/jersey.service';
import { SearchParams } from 'sdk-library';
import { generateGUID } from '../util/identity';
import { UserInternal } from '../models/user';
import { validateRoute, Entity, EntityAction } from '../services/auth-service';

const transformSvg = (xml: string, pallete: Record<string, string>) => {
  if (!xml) {
    return '<svg></svg>';
  }
  Object.entries(pallete).forEach(([key, value]) => {
    xml = xml.replace(
      new RegExp(key, 'g'),
      value.startsWith('#') ? value : `#${value}`
    );
  });

  return xml;
};

const jerseyLabelMapping: Record<string, any> = {
  bib: {
    label: 'Bib',
  },
  stripe: {
    label: 'Stripe',
  },
  sash: {
    label: 'Sash',
  },
  quad: {
    label: 'Quad',
  },
  chopper: {
    label: 'New York Fancy Blue',
  },
  cutter: {
    label: 'Chicago Cutter Blue',
  },
};

const logos = [
  {
    url: 'https://dcassetcdn.com/design_img/2631199/517402/517402_14205626_2631199_02ff10ad_image.jpg',
    name: 'Orange Boat',
  },
  {
    url: 'https://www.bestfreewebresources.com/wp-content/uploads/2015/09/6-euro-yatch.jpg',
    name: 'Euro Yatch',
  },
];

export const getJerseysConfig = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const jerseysData = await readDirectory('/assets/jerseys');
    const jerseys = jerseysData.map((x) => ({
      ...x,
      ...(jerseyLabelMapping[x.key] || {}),
    }));
    res.json({ jerseys, logos });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const downloadJersey = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, ...pallete } = <any>req.query;

    const svg = readSvg(`/assets/jerseys/${name}.svg`, false);
    const transformedSvg = transformSvg(svg, pallete);

    res.attachment(`${name}.svg`);
    res.type('svg');
    res.send(transformedSvg);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const handleCreateJersey = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.locals?.user?.id;
    const id = generateGUID();
    const body = req.body;
    const response = await createJersey(id, { ...body, userId: userId, id });
    res.json(response);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const handleRetriveJersey = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // //  Validate Route Access
    const userId = req.locals?.user?.id;

    //  Unpack
    const response = await retrieveJersey({ search: { match: { userId } } });
    res.json(response);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const handleSearchJersey = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const params = <SearchParams>req.body;
    //  Unpack
    const response = await retrieveJersey(params);
    res.json(response);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const retriveJerseyByTeamId = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: boathouseId } = req.query;

    const response = await matchJersey({
      search: { match: { boathouseId } },
    });
    res.json(response);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const handleUpdateJersey = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const update = req.body;
    const userId = req.locals?.user?.id;

    update.userId = userId;

    await updateJersey(id, update);

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    next(err);
  }
};


export const handleDeleteJersey = async (req: CustomRequest, res: Response, next: NextFunction) => {

  try {
    //  Get the logged in user
    const user: UserInternal = req.locals.user;

    //  TODO:  Route Access!

    //  Get the Jersey ID
    const jerseyId = req.params.jerseyId;

    //  Delete the Jersey
    const deletedJersey = await deleteJersey(jerseyId, user);

    //  Return the workout
    res.status(200).json(deletedJersey);

  } catch (err) {
    //  TODO:  Catch system errors.
    next(err);
  }
};