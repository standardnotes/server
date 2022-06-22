import { SignInDTOV1Unchallenged } from './SignInDTOV1Unchallenged'
import { SignInDTOV2Challenged } from './SignInDTOV2Challenged'

export type SignInDTO = SignInDTOV1Unchallenged | SignInDTOV2Challenged
