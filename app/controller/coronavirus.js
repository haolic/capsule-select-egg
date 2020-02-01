'use strict';

const Controller = require('egg').Controller;

class CoronavirusController extends Controller {
  async index() {
    const { ctx, app } = this;
    const res = await app.mysql.query(`
      SELECT *, DATE_FORMAT(date, '%Y-%m-%d') as date FROM coronavirus ORDER BY date ASC LIMIT 0, 50
    `);
    ctx.body = {
      success: true,
      result: res
    };
  }

  async insertData() {
    const { ctx, app } = this;
    const { date, value, died, cure, ext } = ctx.request.body;

    const preInsert = await app.mysql.select('coronavirus', {
      where: { date }
    });
    // console.log(ctx.request.body);
    const row = {
      date,
      value,
      died,
      cure,
      ext: ext || null
    };
    if (row.value === null) {
      // 删除当前行数据。
      const result = await this.app.mysql.delete('coronavirus', {
        date
      });
      if (result.affectedRows === 1) {
        ctx.body = {
          success: true,
          msg: '删除成功',
          result: preInsert
        };
        return;
      }
      ctx.body = {
        success: false,
        errMsg: '删除失败，无当天数据。',
        result: preInsert
      };
      return;
    }
    if (preInsert && preInsert.length) {
      // 存在当前日期数据，则更新当前日期数据；
      const result = await this.app.mysql.update('coronavirus', {
        id: preInsert[0].id,
        ...row
      });
      if (result.affectedRows === 1) {
        // 更新成功。
        ctx.body = {
          success: true,
          msg: '操作成功',
          result: preInsert
        };
        return;
      }
      // 更新失败。
      ctx.body = {
        success: false,
        msg: '操作失败',
        result: preInsert
      };
      return;
    }
    const res = await app.mysql.insert('coronavirus', row);
    if (res.affectedRows === 1) {
      ctx.body = {
        success: true,
        msg: '操作成功',
        result: res
      };
    } else {
      ctx.body = {
        success: true,
        msg: '操作失败',
        result: res
      };
    }
  }
}

module.exports = CoronavirusController;
