class ApiFeatures {
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }

    filter() {
        const queryStringObject = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
        excludedFields.forEach((field) => delete queryStringObject[field]);

        let queryStr = JSON.stringify(queryStringObject);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

        this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.sort(sortBy);
        } else {
            this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.select(fields);
        } else {
            this.mongooseQuery = this.mongooseQuery.select('-__v');
        }
        return this;
    }

    paginate(countDocuments) {
        const page = Math.max(Number(this.queryString.page) || 1, 1);
        const rawLimit = Number(this.queryString.limit) || 20;
        const limit = Math.min(Math.max(rawLimit, 1), 50); // سقف أقصى 50 عنصر
        const skip = (page - 1) * limit;
        const endIndex = page * limit;

        const pagination = {
            page,
            limit,
            numberOfPages: Math.ceil(countDocuments / limit) || 1,
            totalCount: countDocuments,
        };

        if (endIndex < countDocuments) {
            pagination.next = page + 1;
        }
        if (skip > 0) {
            pagination.prev = page - 1;
        }

        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
        this.pagination = pagination;
        return this;
    }

    search() {
        if (this.queryString.keyword) {
            const escapedKeyword = this.queryString.keyword
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            this.mongooseQuery = this.mongooseQuery.find({
                $or: [
                    { name: { $regex: escapedKeyword, $options: 'i' } },
                    { description: { $regex: escapedKeyword, $options: 'i' } },
                    { woodType: { $regex: escapedKeyword, $options: 'i' } },
                    { category: { $regex: escapedKeyword, $options: 'i' } },
                ],
            });
        }
        return this;
    }
}

module.exports = ApiFeatures;