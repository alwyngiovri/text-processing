var sastrawi = require('sastrawijs');
var sw = require('stopword')

var natural = require('natural');
var TfIdf = natural.TfIdf;

// DOKUMEN
var d1 = "Rancang Bangun Sistem Pakar Berbasis Web Untuk Mendiagnosa Penyakit pada Sapi Perah";
var d2 = "Sistem Pendukung Keputusan Pemilihan Gadget Android Menggunakan Metode Promethee";
var d3 = "Implementasi Metode Electre pada Sistem Pendukung Keputusan SNMPTN Jalur Undangan";
var q = "Sistem Pakar Diagnosis Penyakit Unggas dengan Metode Certainty Factor";

document.getElementById('d1').innerHTML = d1;
document.getElementById('d2').innerHTML = d2;
document.getElementById('d3').innerHTML = d3;
document.getElementById('q').innerHTML = q;

// TOKEN + LOWER CASE
var tokenizer = new sastrawi.Tokenizer();

var tl_d1 = tokenizer.tokenize(d1.toLowerCase());
var tl_d2 = tokenizer.tokenize(d2.toLowerCase());
var tl_d3 = tokenizer.tokenize(d3.toLowerCase());
var tl_q = tokenizer.tokenize(q.toLowerCase());

document.getElementById('tl_d1').innerHTML = tl_d1;
document.getElementById('tl_d2').innerHTML = tl_d2;
document.getElementById('tl_d3').innerHTML = tl_d3;
document.getElementById('tl_q').innerHTML = tl_q;

// STEMMING
var stemmer = new sastrawi.Stemmer();

function stemming(words, mVar) {
    words.forEach(word => {
        mVar.push(stemmer.stem(word));
    });
}

var stem_d1 = [];
var stem_d2 = [];
var stem_d3 = [];
var stem_q = [];

stemming(tl_d1, stem_d1);
stemming(tl_d2, stem_d2);
stemming(tl_d3, stem_d3);
stemming(tl_q, stem_q);

document.getElementById('stem_d1').innerHTML = stem_d1;
document.getElementById('stem_d2').innerHTML = stem_d2;
document.getElementById('stem_d3').innerHTML = stem_d3;
document.getElementById('stem_q').innerHTML = stem_q;

// STOPWORD REMOVAL
const sw_d1 = sw.removeStopwords(stem_d1, sw.id);
const sw_d2 = sw.removeStopwords(stem_d2, sw.id);
const sw_d3 = sw.removeStopwords(stem_d3, sw.id);
const sw_q = sw.removeStopwords(stem_q, sw.id);

document.getElementById('sw_d1').innerHTML = sw_d1;
document.getElementById('sw_d2').innerHTML = sw_d2;
document.getElementById('sw_d3').innerHTML = sw_d3;
document.getElementById('sw_q').innerHTML = sw_q;

// TERM UNIQUE
const unique = (value, index, self) => {
    return self.indexOf(value) === index
}

var termsAll = [...sw_d1, ...sw_d2, ...sw_d3, ...sw_q];
console.log(termsAll); // 35

var terms = termsAll.filter(unique)
console.log(terms); // 26

// TF-IDF
var tfidf = new TfIdf();

tfidf.addDocument(sw_d1);
tfidf.addDocument(sw_d2);
tfidf.addDocument(sw_d3);
tfidf.addDocument(sw_q);

var tfidf_D1 = [];
var tfidf_D2 = [];
var tfidf_D3 = [];
var tfidf_Q = [];

var divTfidf = document.getElementById('tableTfidf');
terms.forEach(item => {
    console.log(item);

    var row = divTfidf.insertRow();
    var cel1 = row.insertCell(0);
    cel1.innerHTML = item;

    tfidf.tfidfs(item, function (i, measure) {
        // Last document is Query 
        if (i == 3) {
            console.log('document #Q' + ' is ' + measure);
        } else {
            console.log('document #' + (i + 1) + ' is ' + measure);
        }

        var cels = row.insertCell(i + 1);
        cels.innerHTML = measure;

        switch (i) {
            case 0:
                tfidf_D1.push(measure);
                break;
            case 1:
                tfidf_D2.push(measure);
                break;
            case 2:
                tfidf_D3.push(measure);
                break;
            case 3:
                tfidf_Q.push(measure);
                break;
            default:
                break;
        }
    });
});

// COSINE SIMILARITY + RANK
function cosinesim(A, B) {
    var dotproduct = 0;
    var mA = 0;
    var mB = 0;
    for (var i = 0; i < A.length; i++) {
        dotproduct += (A[i] * B[i]);
        mA += (A[i] * A[i]);
        mB += (B[i] * B[i]);
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    var similarity = (dotproduct) / ((mA) * (mB));
    return similarity;
}

var cosims = [];
cosims.push(cosinesim(tfidf_Q, tfidf_D1));
cosims.push(cosinesim(tfidf_Q, tfidf_D2));
cosims.push(cosinesim(tfidf_Q, tfidf_D3));

var sorted = cosims.slice().sort(function (a, b) { return b - a })
var ranks = cosims.map(function (v) { return sorted.indexOf(v) + 1 });

document.getElementById('cos_d1').innerHTML = `${cosinesim(tfidf_Q, tfidf_D1)} - Rank : ${ranks[0]}`;
document.getElementById('cos_d2').innerHTML = `${cosinesim(tfidf_Q, tfidf_D2)} - Rank : ${ranks[1]}`;
document.getElementById('cos_d3').innerHTML = `${cosinesim(tfidf_Q, tfidf_D3)} - Rank : ${ranks[2]}`;

// NAIVE BAYES CLASSIFIER
var classifier = new natural.BayesClassifier();

var datas = {
    docs: [],
    categories: []
}

datas.docs.push(d1);
datas.categories.push('Sistem Pakar');

datas.docs.push(d2);
datas.categories.push('Sistem Pendukung Keputusan');

datas.docs.push(d3);
datas.categories.push('Sistem Pendukung Keputusan');

datas.docs.forEach((item, idx) => {
    classifier.addDocument(item, datas.categories[idx]);
});

classifier.train();

document.getElementById('bay_d1').innerHTML = `${datas.docs[0]} - ${datas.categories[0]}`;
document.getElementById('bay_d2').innerHTML = `${datas.docs[1]} - ${datas.categories[1]}`;
document.getElementById('bay_d3').innerHTML = `${datas.docs[2]} - ${datas.categories[2]}`;

var clasify = classifier.classify(q)
document.getElementById('clasify').innerHTML = ` ${q} = <b>${clasify} </b>`;

// PRECISSION AND RECALL
function precisionRecall(relevantStrings, retrievedStrings) {
    if (!relevantStrings || relevantStrings.length === 0) {
        return defaultValues;
    }

    if (!retrievedStrings || retrievedStrings.length === 0) {
        return defaultValues;
    }

    var relevantSet = new Set(relevantStrings);
    var uniqueRelevant = Array.from(relevantSet);

    var retrievedSet = new Set(retrievedStrings);
    var uniqueRetrieved = Array.from(retrievedSet);

    var intersection = uniqueRelevant.filter(function (x) {
        return retrievedSet.has(x);
    });

    if (!intersection || intersection.length === 0) {
        return defaultValues;
    }

    var precision = intersection.length / uniqueRetrieved.length;
    var recall = intersection.length / uniqueRelevant.length;
    var f = 2 * (precision * recall) / (precision + recall);
    return {
        precision: precision,
        recall: recall,
        f: f
    };
};

// what we expect to get
var relevant = d1;
document.getElementById('relevant').innerHTML = relevant;
// what we actually got
var retrieved = d2;
document.getElementById('retrieved').innerHTML = retrieved;

// call the func
var sentences = precisionRecall(relevant, retrieved);
document.getElementById('result').innerHTML = JSON.stringify(sentences);