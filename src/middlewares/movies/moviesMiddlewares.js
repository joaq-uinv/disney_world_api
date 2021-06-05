const { check } = require("express-validator");
const multer = require("multer");
const upload = multer();
const AppError = require("../../handlers/AppError");
const { USER_ROLE, ADMIN_ROLE } = require("../../constants/constants");
const {
  commonValidationResult,
  imageRequired,
} = require("../commonMiddlewares");
const { validJWT, hasRole } = require("../auth/authMiddlewares");
const MovieServices = require("../../services/MovieServices");
const movieServices = new MovieServices();
const GenreServices = require("../../services/GenreServices");
const genreServices = new GenreServices();
const ContentTypeServices = require("../../services/ContentTypeServices");
const contentTypeServices = new ContentTypeServices();

const _titleRequired = check("title", "Title required").not().isEmpty();

const _isRoleValid = check("role")
  .optional()
  .custom(async (role = "") => {
    const ROLES = [USER_ROLE, ADMIN_ROLE];
    !ROLES.includes(role) && new AppError("Invalid role", 400);
  });

const _idRequired = check("id").not().isEmpty();
const _isIDNumeric = check("id").isNumeric();
const _idExists = check("id").custom(async (id = "") => {
  const foundMovie = await movieServices.getByID(id);
  if (!foundMovie) {
    throw new AppError(`Character with ID ${id} does not exist`, 400);
  }
});

const _ratingRequired = check("rating").not().isEmpty();
const _isRatingNumeric = check("rating").isNumeric();
const _isRatingOptional = check("rating").optional().isNumeric();
const _creationDateRequired = check("creationDate").not().isEmpty();
const _isCreationDateValid = check("creationDate")
  .optional()
  .isDate("MM-DD-YYYY");
const _titleExists = check("title").custom(async (title = "") => {
  const foundTitle = await movieServices.findByTitle(title);
  if (foundTitle) {
    throw new AppError(
      `A movie with the title ${foundTitle} already exists in the DB`,
      400
    );
  }
});

const _isContentTypeValid = async (contentType = "") => {
  const foundContentType = await contentTypeServices.getByDescription(
    contentType
  );
  !foundContentType &&
    new AppError(`The content type ${contentType} does not exist`, 400);
};
const _isGenreValid = async (genre = "") => {
  const foundgenre = await genreServices.getByDescription(genre);
  !foundgenre && new AppError(`The genre ${genre} does not exist`, 400);
};

const _contentTypeExists = check("contentType").custom(_isContentTypeValid);
const _genreExists = check("genre").custom(_isGenreValid);
const _optionalContentTypeExists = check("contentType")
  .optional()
  .custom(_isContentTypeValid);
const _optionalGenreExists = check("genre").optional().custom(_isGenreValid);

const getAllRequestValidations = [validJWT];

const getRequestValidations = [
  validJWT,
  _idRequired,
  _isIDNumeric,
  _idExists,
  commonValidationResult,
];

const postRequestValidations = [
  validJWT,
  hasRole(ADMIN_ROLE),
  _titleRequired,
  _titleExists,
  _ratingRequired,
  _isRatingNumeric,
  _creationDateRequired,
  _isCreationDateValid,
  _contentTypeExists,
  _genreExists,
  _isRoleValid,
  commonValidationResult,
];

const postImageRequestValidations = [
  validJWT,
  hasRole(USER_ROLE, ADMIN_ROLE),
  upload.single("image"),
  _idRequired,
  _isIDNumeric,
  _idExists,
  imageRequired,
  commonValidationResult,
];

const putRequestValidations = [
  validJWT,
  hasRole(ADMIN_ROLE),
  _idRequired,
  _isIDNumeric,
  _idExists,
  _titleExists,
  _isRatingOptional,
  _isCreationDateValid,
  _optionalContentTypeExists,
  _optionalGenreExists,
  _isRoleValid,
  commonValidationResult,
];

const deleteRequestValidations = [
  validJWT,
  hasRole(ADMIN_ROLE),
  _idRequired,
  _isIDNumeric,
  _idExists,
  commonValidationResult,
];

module.exports = {
  getAllRequestValidations,
  getRequestValidations,
  postRequestValidations,
  postImageRequestValidations,
  putRequestValidations,
  deleteRequestValidations,
};
