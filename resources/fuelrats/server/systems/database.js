import * as alt from 'alt';
import mongodb from 'mongodb';
import chalk from 'chalk';

const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;

let instance;

alt.log(chalk.greenBright('Loaded: systems/database'));

export default class ConnectionInfo {
    /**
     *
     * @param {MongoClient} client
     */
    constructor() {
        alt.log('Starting connection...');
        if (instance) {
            return instance;
        }

        if (process.env['ENVIRONMENT'] !== 'dev') {
            console.log(`Running Producting Database`);

            /** @type {mongodb.MongoClient} */
            this.client = new MongoClient('mongodb://localhost:27017', {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                auth: {
                    user: process.env['DB_USER'],
                    password: process.env['DB_PASS']
                }
            });
        } else {
            /** @type {mongodb.MongoClient} */
            this.client = new MongoClient('mongodb://localhost:27017', {
                useUnifiedTopology: true,
                useNewUrlParser: true
            });
        }

        this.initConnection();
    }

    async initConnection() {
        try {
            this.instance = await this.client.connect();
        } catch (err) {
            this.initConnection();
            return;
        }

        try {
            this.db = this.instance.db('fuelrats');
        } catch (err) {}

        this.generateCollections();
        instance = this;
    }

    async generateCollections() {
        if (!this.db.collection('accounts')) {
            await this.db.createCollection('accounts');
        }

        alt.emit('database:Ready');
    }

    /**
     * @param {String} fieldName Field we want to modify.
     * @param {Any} fieldValue Field value we want to find.
     * @param {String} collection Name of the collection.
     * @returns {Any | null} A single document.
     */
    async fetchData(fieldName, fieldValue, collection) {
        if (fieldName === '_id') {
            fieldValue = new ObjectID(fieldValue);
        }

        const results = await this.db.collection(collection).findOne({ [fieldName]: fieldValue });

        return results;
    }

    /**
     * @param {String} fieldName Field we want to modify.
     * @param {Any} fieldValue Field value we want to find.
     * @param {String} collection Name of the collection.
     * @returns {Array | null} An array of documents.
     */
    async fetchAllByField(fieldName, fieldValue, collection) {
        if (fieldName === '_id') {
            fieldValue = new ObjectID(fieldValue);
        }

        const results = await this.db
            .collection(collection)
            .find({ [fieldName]: fieldValue })
            .toArray();

        if (results.length <= 0) {
            return [];
        }

        return results;
    }

    /**
     * Insert a document and return the ID.
     * @param {*} document
     * @param {*} collection
     * @param {Boolean} returnDocument
     * @returns {{_id, a, b, c}} Document
     */
    async insertData(document, collection, returnDocument = false) {
        const id = await (await this.db.collection(collection).insertOne(document)).insertedId;

        if (!returnDocument) {
            return id;
        }

        return await this.db.collection(collection).findOne({ _id: ObjectID(id) });
    }

    /**
     *
     * @param {*} id
     * @param {*} partialObjectData
     * @param {*} collection
     */
    async updatePartialData(id, partialObjectData, collection) {
        await this.db
            .collection(collection)
            .findOneAndUpdate({ _id: ObjectID(id) }, { $set: { ...partialObjectData } });
    }

    /**
     * Delete data by id.
     * @param {*} id
     * @param {*} collection
     */
    async deleteById(id, collection) {
        await this.db.collection(collection).findOneAndDelete({ _id: ObjectID(id) });
    }

    /**
     * Fetch all data in a collection.
     * @param {*} collection
     */
    async fetchAllData(collection) {
        return await this.db
            .collection(collection)
            .find()
            .toArray();
    }

    /**
     * Select specific fields from the collection; and return all data.
     * @param {*} collection
     * @param {*} fieldNames
     */
    async selectData(collection, fieldNames) {
        const selectData = {
            _id: 1
        };

        fieldNames.forEach(name => {
            selectData[name] = 1;
        });

        return await this.db
            .collection(collection)
            .find({})
            .project({ ...selectData })
            .toArray();
    }

    /**
     * Update partial data based on other parameters.
     * @param {*} fieldName
     * @param {*} fieldValue
     * @param {{name: 'stuyk'}} partialObjectData merely an example
     * @param {*} collection
     */
    async updateDataByFieldMatch(fieldName, fieldValue, partialObjectData, collection) {
        if (fieldName === '_id') {
            fieldValue = ObjectID(fieldValue);
        }

        await this.db
            .collection(collection)
            .findOneAndUpdate({ [fieldName]: fieldValue }, { $set: { ...partialObjectData } });
    }

    /**
     *
     * @param {*} id
     * @param {*} fieldName
     * @param {*} fieldValue
     * @param {*} collection
     */
    async replaceField(oldValue, fieldName, fieldValue, collection) {
        await this.db
            .collection(collection)
            .updateMany({ [fieldName]: oldValue }, { $set: { [fieldName]: fieldValue } });
    }
}
