// 引入Theaters

const Theaters = require('../../model/Theaters');

module.exports = async (data) => {
    for (var i = 0; i < data.length; i++) {
        let item = data[i];
        const result = await Theaters.create({
            title: item.title,
            rating: item.rating,
            runtime: item.runtime,
            director: item.director,
            casts: item.casts,
            images: item.images,
            doubanId: item.doubanId,
            genre: item.genre,
            summary: item.summary,
            releaseDate: item.releaseDate,
        })

        console.log('数据保存成功');
        console.log(result);
    }
}