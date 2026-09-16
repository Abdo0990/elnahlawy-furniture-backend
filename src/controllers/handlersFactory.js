const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const document = await Model.findByIdAndDelete(id);

        if (!document) {
            return next(new ApiError(`لا يوجد عنصر بهذا المعرف: ${id}`, 404));
        }

        res.status(200).json({
            status: 'success',
            message: 'تم الحذف بنجاح',
            data: null,
        });
    });

exports.updateOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const document = await Model.findByIdAndUpdate(id, req.body, {
            returnDocument: 'after',
            runValidators: true,
        });

        if (!document) {
            return next(new ApiError(`لا يوجد عنصر بهذا المعرف: ${id}`, 404));
        }

        res.status(200).json({
            status: 'success',
            message: 'تم التعديل بنجاح',
            data: document,
        });
    });

exports.createOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const newDoc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            message: 'تم الإنشاء بنجاح',
            data: newDoc,
        });
    });

exports.getOne = (Model, populationOpt) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        let query = Model.findById(id);
        if (populationOpt) {
            query = query.populate(populationOpt);
        }

        const document = await query;
        if (!document) {
            return next(new ApiError(`لا يوجد عنصر بهذا المعرف: ${id}`, 404));
        }

        res.status(200).json({
            status: 'success',
            data: document,
        });
    });

exports.getAll = (Model) =>
    asyncHandler(async (req, res, next) => {
        let filter = {};
        if (req.filterObj) {
            filter = req.filterObj;
        }

        const totalDocumentsCount = await Model.countDocuments(filter);

        const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
            .paginate(totalDocumentsCount)
            .filter()
            .search()
            .limitFields()
            .sort();

        const { mongooseQuery, pagination } = apiFeatures;
        const documents = await mongooseQuery;

        res.status(200).json({
            status: 'success',
            results: documents.length,
            pagination,
            data: documents,
        });
    });